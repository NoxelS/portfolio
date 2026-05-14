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
    settings: Settings | None = None,
) -> dict[str, object]:
    """Search indexed content chunks and rerank the best candidates."""

    settings = settings or get_settings()
    normalized_query = query.strip()
    if not normalized_query:
        raise ValueError("Query must not be empty.")

    safe_top_n = max(1, min(top_n, MAX_TOP_N))
    retrieval_k = min(safe_top_n * 3, MAX_RETRIEVAL_K)

    query_vector = embed_query(normalized_query, settings=settings)
    candidates = search_knn(query_vector, retrieval_k=retrieval_k, settings=settings)
    results = rerank_candidates(normalized_query, candidates, top_n=safe_top_n, settings=settings)
    return {
        "query": normalized_query,
        "top_n": safe_top_n,
        "retrieval_k": retrieval_k,
        "count": len(results),
        "results": results,
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
        if isinstance(document, list) and document:
            parsed = document[0]
        else:
            parsed = document
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
