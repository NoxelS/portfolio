import json
import math
from array import array

from redis import Redis

from api.core.bootstrap import wait_for_redis
from api.core.config import Settings, get_settings
from api.core.model_client import create_embedding_model, create_reranker_model

DEFAULT_TOP_N = 10
MAX_TOP_N = 25
MAX_RETRIEVAL_K = 50


def search_content(
    query: str,
    *,
    top_n: int = DEFAULT_TOP_N,
    rewritten_query: str | None = None,
    settings: Settings | None = None,
) -> dict[str, object]:
    """Search indexed content chunks and rerank the best candidates."""

    settings = settings or get_settings()
    normalized_query = query.strip()
    if not normalized_query:
        raise ValueError("Query must not be empty.")

    safe_top_n = max(1, min(top_n, settings.retrieval_max_top_n))
    retrieval_k = min(safe_top_n * settings.retrieval_multiplier, settings.retrieval_max_k)

    query_vector = embed_query(normalized_query, settings=settings)

    raw_candidates = search_knn(query_vector, retrieval_k=retrieval_k, settings=settings)
    rewritten_candidates: list[dict[str, object]] = []
    rewritten_normalized = ""

    if rewritten_query:
        rewritten_normalized = rewritten_query.strip()
        if rewritten_normalized and rewritten_normalized != normalized_query:
            rewritten_vector = embed_query(rewritten_normalized, settings=settings)
            rewritten_candidates = search_knn(rewritten_vector, retrieval_k=retrieval_k, settings=settings)

    candidates = merge_candidates(raw_candidates, rewritten_candidates)
    results = rerank_candidates_dual(
        normalized_query,
        rewritten_normalized or None,
        candidates,
        top_n=safe_top_n,
        settings=settings,
    )
    filtered_results = filter_reranked_results(results, settings=settings)
    return {
        "query": normalized_query,
        "rewritten_query": rewritten_normalized or None,
        "top_n": safe_top_n,
        "retrieval_k": retrieval_k,
        "raw_count": len(raw_candidates),
        "rewritten_count": len(rewritten_candidates),
        "merged_count": len(candidates),
        "reranked_count": len(results),
        "count": len(filtered_results),
        "results": filtered_results,
    }


def embed_query(query: str, *, settings: Settings | None = None) -> list[float]:
    """Embed a query string for vector search."""

    settings = settings or get_settings()
    embedder = create_embedding_model(settings)
    vectors = embedder.embed([query], as_passage=False)
    if len(vectors) != 1:
        raise ValueError("Embedding service returned an unexpected query embedding count.")
    return vectors[0]


def search_knn(
    query_vector: list[float],
    *,
    retrieval_k: int,
    settings: Settings | None = None,
) -> list[dict[str, object]]:
    """Run a Redis vector KNN search and return chunk candidates."""

    settings = settings or get_settings()
    redis = Redis.from_url(settings.redis_url, decode_responses=False)
    wait_for_redis(redis)

    response = redis.execute_command(
        "FT.SEARCH",
        settings.redis_index_name,
        f"*=>[KNN {retrieval_k} @embedding $BLOB AS vector_distance]",
        "PARAMS",
        "2",
        "BLOB",
        encode_vector(query_vector),
        "SORTBY",
        "vector_distance",
        "NOCONTENT",
        "LIMIT",
        "0",
        str(retrieval_k),
        "DIALECT",
        "2",
    )
    return load_candidates(redis, response)


def rerank_candidates(
    query: str,
    candidates: list[dict[str, object]],
    *,
    top_n: int,
    settings: Settings | None = None,
) -> list[dict[str, object]]:
    """Rerank Redis candidates and return the best matches with display scores."""

    if not candidates:
        return []

    settings = settings or get_settings()
    reranker = create_reranker_model(settings)
    documents = [build_rerank_text(candidate) for candidate in candidates]
    reranked = reranker.rerank(query, documents, top_n=top_n)

    results: list[dict[str, object]] = []
    for index, score in sorted(reranked, key=lambda item: item[1], reverse=True):
        if index < 0 or index >= len(candidates):
            continue
        candidate = dict(candidates[index])
        candidate["rerank_score"] = score
        candidate["relevance"] = score_to_percent(score)
        candidate["relevance_percent"] = candidate["relevance"]
        results.append(candidate)

    return results


RERANK_CANDIDATE_CAP = 30


def rerank_candidates_dual(
    query: str,
    rewritten_query: str | None,
    candidates: list[dict[str, object]],
    *,
    top_n: int,
    settings: Settings | None = None,
) -> list[dict[str, object]]:
    """Rerank candidates against the original and rewritten query, then merge."""

    if not candidates:
        return []

    capped = candidates[:RERANK_CANDIDATE_CAP]
    full_top_n = len(capped)
    primary_results = rerank_candidates(query, capped, top_n=full_top_n, settings=settings)
    secondary_results: list[dict[str, object]] = []

    normalized_rewritten_query = (rewritten_query or "").strip()
    if normalized_rewritten_query and normalized_rewritten_query != query.strip():
        secondary_results = rerank_candidates(normalized_rewritten_query, capped, top_n=full_top_n, settings=settings)

    merged_results = merge_reranked_results(primary_results, secondary_results)
    return merged_results[:top_n]


def merge_candidates(*candidate_sets: list[dict[str, object]]) -> list[dict[str, object]]:
    """Merge candidate lists and deduplicate them by Redis key."""

    merged: list[dict[str, object]] = []
    seen_keys: set[str] = set()

    for candidate_set in candidate_sets:
        for candidate in candidate_set:
            redis_key = str(candidate.get("redis_key", "")).strip()
            dedupe_key = redis_key or str(candidate.get("path", "")).strip() or str(candidate.get("title", "")).strip()
            if not dedupe_key or dedupe_key in seen_keys:
                continue

            seen_keys.add(dedupe_key)
            merged.append(dict(candidate))

    return merged


def merge_reranked_results(*result_sets: list[dict[str, object]]) -> list[dict[str, object]]:
    """Merge reranked results and keep the strongest score per candidate."""

    merged: dict[str, dict[str, object]] = {}

    for result_set in result_sets:
        for result in result_set:
            dedupe_key = candidate_dedupe_key(result)
            if not dedupe_key:
                continue

            existing = merged.get(dedupe_key)
            current_score = float(result.get("rerank_score", 0.0))
            if existing is None:
                merged_result = dict(result)
                merged_result["best_rerank_score"] = current_score
                merged_result["best_relevance"] = float(result.get("relevance", 0.0))
                merged[dedupe_key] = merged_result
                continue

            existing_score = float(existing.get("best_rerank_score", existing.get("rerank_score", 0.0)))
            if current_score > existing_score:
                updated = dict(result)
                updated["best_rerank_score"] = current_score
                updated["best_relevance"] = float(result.get("relevance", 0.0))
                merged[dedupe_key] = updated

    merged_results = list(merged.values())
    merged_results.sort(key=lambda item: float(item.get("best_rerank_score", item.get("rerank_score", 0.0))), reverse=True)
    for result in merged_results:
        result["rerank_score"] = float(result.get("best_rerank_score", result.get("rerank_score", 0.0)))
        result["relevance"] = float(result.get("best_relevance", result.get("relevance", 0.0)))
        result["relevance_percent"] = result["relevance"]
    return merged_results


def filter_reranked_results(
    results: list[dict[str, object]],
    *,
    settings: Settings | None = None,
) -> list[dict[str, object]]:
    """Keep only reranked results above the configured relevance threshold."""

    settings = settings or get_settings()
    threshold = settings.reranker_minimum_relevance_percent
    return [result for result in results if float(result.get("relevance", 0.0)) >= threshold]


def candidate_dedupe_key(candidate: dict[str, object]) -> str:
    """Build a stable dedupe key for a candidate or reranked result."""

    redis_key = str(candidate.get("redis_key", "")).strip()
    return redis_key or str(candidate.get("path", "")).strip() or str(candidate.get("title", "")).strip()


def load_candidates(redis: Redis, response: object) -> list[dict[str, object]]:
    """Load Redis JSON documents for keys returned by FT.SEARCH."""

    if not isinstance(response, list) or len(response) < 1:
        return []

    candidates: list[dict[str, object]] = []
    for raw_key in response[1:]:
        redis_key = decode_redis_value(raw_key)
        if not redis_key:
            continue

        payload = redis.execute_command("JSON.GET", redis_key, "$")
        if not payload:
            continue

        document = json.loads(decode_redis_value(payload))
        parsed = document[0] if isinstance(document[0], dict) else document
        if not isinstance(parsed, dict):
            continue

        parsed.pop("embedding", None)
        parsed["redis_key"] = redis_key
        parsed["vector_distance"] = None
        candidates.append(parsed)

    return candidates


def encode_vector(vector: list[float]) -> bytes:
    """Encode a float vector as a Redis FLOAT32 blob."""

    return array("f", vector).tobytes()


def build_rerank_text(candidate: dict[str, object]) -> str:
    """Build the reranker input text for one candidate chunk."""

    title = str(candidate.get("title", "")).strip()
    content_type = str(candidate.get("content_type", "")).strip()
    content = str(candidate.get("content", "")).strip()
    return f"Title: {title}\nType: {content_type}\n\n{content}".strip()


def score_to_percent(score: float) -> float:
    """Map a reranker score to a human-readable percentage."""

    return round(100.0 / (1.0 + math.exp(-score)), 2)


def decode_redis_value(value: object) -> str:
    """Decode Redis bytes or coerce other scalar values to strings."""

    if isinstance(value, bytes):
        return value.decode("utf-8")
    if value is None:
        return ""
    return str(value)
