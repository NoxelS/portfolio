import json
import re
from collections.abc import Iterator
from dataclasses import dataclass
from math import ceil
from pathlib import Path
from time import perf_counter

from langchain_core.prompts import ChatPromptTemplate

from api.core.config import Settings, get_settings
from api.core.model_client import create_chat_model
from api.core.ntfy_logger import notify_sales_assistant_error, notify_sales_assistant_event
from api.core.search import embed_query, filter_reranked_results, merge_candidates, rerank_candidates_dual, search_content, search_knn

DEFAULT_ASSISTANT_TOP_N = 5
SYSTEM_PROMPT_FILE = "rag-instructions/system.md"
USER_PROMPT_TEMPLATE_FILE = "rag-instructions/user-template.md"
QUERY_REWRITE_SYSTEM_PROMPT_FILE = "rag-instructions/query-rewrite-system.md"
QUERY_REWRITE_TEMPLATE_FILE = "rag-instructions/query-rewrite.md"
NO_CONTEXT_RESPONSE_FILE = "rag-instructions/no-context-response.md"


@dataclass(slots=True)
class RagAnswer:
    """Structured RAG answer for API wrappers and offline evaluations."""

    question: str
    answer: str
    rewritten_query: str | None
    sources: list[dict[str, object]]
    selected_chunks: list[dict[str, object]]
    metadata: dict[str, object]


def answer_rag_question(
    question: str,
    *,
    top_n: int = DEFAULT_ASSISTANT_TOP_N,
    settings: Settings | None = None,
) -> RagAnswer:
    """Run the core RAG flow and return a structured answer."""

    payload = answer_query(question, top_n=top_n, settings=settings)
    results = payload.get("results", [])
    selected_chunks = results if isinstance(results, list) else []
    return RagAnswer(
        question=str(payload.get("query", question)).strip(),
        answer=str(payload.get("answer", "")),
        rewritten_query=payload.get("rewritten_query") if isinstance(payload.get("rewritten_query"), str) else None,
        sources=build_answer_sources(selected_chunks),
        selected_chunks=selected_chunks,
        metadata={
            "count": payload.get("count", 0),
            "top_n": payload.get("top_n", top_n),
            "retrieval_k": payload.get("retrieval_k", 0),
            "raw_count": payload.get("raw_count", 0),
            "rewritten_count": payload.get("rewritten_count", 0),
            "merged_count": payload.get("merged_count", 0),
            "reranked_count": payload.get("reranked_count", 0),
        },
    )


def answer_query(
    query: str,
    *,
    top_n: int = DEFAULT_ASSISTANT_TOP_N,
    settings: Settings | None = None,
) -> dict[str, object]:
    """Answer a user query using retrieved portfolio context."""

    settings = settings or get_settings()
    normalized_query = query.strip()

    try:
        rewritten_query = rewrite_query(normalized_query, settings=settings)
        search_payload = search_content(normalized_query, top_n=top_n, rewritten_query=rewritten_query, settings=settings)
        results = search_payload["results"]
        if not results:
            return build_no_context_payload(normalized_query, rewritten_query, search_payload, settings=settings)

        system_prompt = load_system_prompt(settings.instructions_root / SYSTEM_PROMPT_FILE)
        user_prompt_template = load_system_prompt(settings.instructions_root / USER_PROMPT_TEMPLATE_FILE)
        context, _, packed_results = build_context(
            results,
            query=normalized_query,
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            settings=settings,
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", user_prompt_template),
            ]
        )
        messages = prompt.format_messages(query=normalized_query, context=context)
        response = create_chat_model(settings).invoke(messages)

        payload = {
            "query": normalized_query,
            "answer": response.content,
            "count": len(packed_results),
            "results": packed_results,
            "top_n": search_payload["top_n"],
            "retrieval_k": search_payload["retrieval_k"],
        }
        notify_sales_assistant_event(
            query=normalized_query,
            answer=response.content,
            count=payload["count"],
            top_n=payload["top_n"],
            retrieval_k=payload["retrieval_k"],
            settings=settings,
        )
        return payload
    except Exception as error:
        notify_sales_assistant_error(
            query=normalized_query,
            error_message=str(error),
            settings=settings,
        )
        raise


def stream_answer_query(
    query: str,
    *,
    top_n: int = DEFAULT_ASSISTANT_TOP_N,
    settings: Settings | None = None,
) -> Iterator[str]:
    """Stream an answer and finish with a sources event."""

    settings = settings or get_settings()
    normalized_query = query.strip()
    started_at = perf_counter()

    try:
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Starting query",
                    stage="query",
                    duration_ms=elapsed_ms(started_at),
                )
            ),
        )

        safe_top_n = max(1, min(top_n, settings.retrieval_max_top_n))
        retrieval_k = min(safe_top_n * settings.retrieval_multiplier, settings.retrieval_max_k)

        query_rewrite_system_prompt = load_system_prompt(settings.instructions_root / QUERY_REWRITE_SYSTEM_PROMPT_FILE)
        query_rewrite_prompt = load_system_prompt(settings.instructions_root / QUERY_REWRITE_TEMPLATE_FILE)
        rewrite_started_at = perf_counter()
        rewritten_query = rewrite_query(
            normalized_query,
            settings=settings,
            system_prompt=query_rewrite_system_prompt,
            prompt_template=query_rewrite_prompt,
        )
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Rewriting query",
                    stage="rewrite",
                    duration_ms=elapsed_ms(rewrite_started_at),
                    model=settings.llm_model,
                    rewritten_query=rewritten_query,
                    counts={"input_chars": len(normalized_query), "output_chars": len(rewritten_query)},
                )
            ),
        )

        raw_embed_started_at = perf_counter()
        raw_query_vector = embed_query(normalized_query, settings=settings)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Embedding original query",
                    stage="embedding",
                    duration_ms=elapsed_ms(raw_embed_started_at),
                    model=settings.embedding_model,
                    counts={"input": 1},
                    debug={"vector_stats": compute_vector_stats(raw_query_vector), "query_text": normalized_query},
                )
            ),
        )

        raw_retrieval_started_at = perf_counter()
        raw_candidates = search_knn(raw_query_vector, retrieval_k=retrieval_k, settings=settings)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Retrieving raw query chunks",
                    stage="retrieval",
                    duration_ms=elapsed_ms(raw_retrieval_started_at),
                    counts={"retrieved": len(raw_candidates), "requested": retrieval_k},
                    debug={"candidates": summarize_candidates(raw_candidates)},
                )
            ),
        )

        rewritten_embed_started_at = perf_counter()
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Embedding rewritten query",
                    stage="embedding",
                    duration_ms=elapsed_ms(rewritten_embed_started_at),
                    model=settings.embedding_model,
                    counts={"input": 1},
                    rewritten_query=rewritten_query,
                    debug={"query_text": rewritten_query},
                )
            ),
        )
        rewritten_query_vector = embed_query(rewritten_query, settings=settings)
        rewritten_retrieval_started_at = perf_counter()
        rewritten_candidates = search_knn(rewritten_query_vector, retrieval_k=retrieval_k, settings=settings)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Retrieving rewritten query chunks",
                    stage="retrieval",
                    duration_ms=elapsed_ms(rewritten_retrieval_started_at),
                    counts={"retrieved": len(rewritten_candidates), "requested": retrieval_k},
                    rewritten_query=rewritten_query,
                    debug={"candidates": summarize_candidates(rewritten_candidates)},
                )
            ),
        )

        merge_started_at = perf_counter()
        merged_candidates = merge_candidates(raw_candidates, rewritten_candidates)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Merging retrieval results",
                    stage="merge",
                    duration_ms=elapsed_ms(merge_started_at),
                    counts={"raw": len(raw_candidates), "rewritten": len(rewritten_candidates), "merged": len(merged_candidates)},
                    rewritten_query=rewritten_query,
                )
            ),
        )

        rerank_started_at = perf_counter()
        reranked_results = rerank_candidates_dual(
            normalized_query,
            rewritten_query,
            merged_candidates,
            top_n=safe_top_n,
            settings=settings,
        )
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Reranking original and rewritten query",
                    stage="rerank",
                    duration_ms=elapsed_ms(rerank_started_at),
                    model=settings.reranker_model,
                    counts={
                        "input": len(merged_candidates),
                        "output": len(reranked_results),
                        "top_n": safe_top_n,
                        "queries": 2 if rewritten_query.strip() and rewritten_query.strip() != normalized_query else 1,
                    },
                    rewritten_query=rewritten_query,
                    debug={"results": summarize_candidates(reranked_results, max_items=8)},
                )
            ),
        )

        filter_started_at = perf_counter()
        results = filter_reranked_results(reranked_results, settings=settings)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Filtering low-confidence results",
                    stage="filter",
                    duration_ms=elapsed_ms(filter_started_at),
                    counts={
                        "input": len(reranked_results),
                        "kept": len(results),
                        "threshold": settings.reranker_minimum_relevance_percent,
                    },
                    rewritten_query=rewritten_query,
                    debug={
                        "all_results": summarize_candidates(reranked_results, max_items=8),
                        "kept": [str(c.get("title", "")) for c in results],
                        "dropped": [str(c.get("title", "")) for c in reranked_results if c not in results],
                    },
                )
            ),
        )

        if not results:
            fallback_answer = load_system_prompt(settings.instructions_root / NO_CONTEXT_RESPONSE_FILE)
            yield sse_event(
                "step",
                json.dumps(
                    step_payload(
                        "No relevant context found",
                        stage="fallback",
                        duration_ms=0,
                        counts={"threshold": settings.reranker_minimum_relevance_percent},
                        rewritten_query=rewritten_query,
                    )
                ),
            )
            yield sse_event("token", fallback_answer)
            yield sse_event(
                "sources",
                json.dumps(
                    {
                        "query": normalized_query,
                        "rewritten_query": rewritten_query,
                        "count": 0,
                        "results": [],
                        "top_n": safe_top_n,
                        "retrieval_k": retrieval_k,
                        "raw_count": len(raw_candidates),
                        "rewritten_count": len(rewritten_candidates),
                        "merged_count": len(merged_candidates),
                        "reranked_count": len(reranked_results),
                    }
                ),
            )
            yield sse_event("done", "")
            return

        system_prompt = load_system_prompt(settings.instructions_root / SYSTEM_PROMPT_FILE)
        user_prompt_template = load_system_prompt(settings.instructions_root / USER_PROMPT_TEMPLATE_FILE)
        context, context_stats, packed_results = build_context(
            results,
            query=normalized_query,
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            settings=settings,
        )
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Packing context",
                    stage="packing",
                    duration_ms=0,
                    counts=context_stats,
                    rewritten_query=rewritten_query,
                    debug={
                        "included": [str(c.get("title", "")) for c in packed_results],
                        "skipped": [str(c.get("title", "")) for c in results if c not in packed_results],
                    },
                )
            ),
        )

        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Loading prompt",
                    stage="prompt",
                    duration_ms=0,
                    counts={"context_items": context_stats["included_chunks"]},
                )
            ),
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", user_prompt_template),
            ]
        )
        messages = prompt.format_messages(query=normalized_query, context=context)
        model = create_chat_model(settings)

        rag_query_str = "\n\n".join(f"<{msg.type}>\n{msg.content}\n</{msg.type}>" for msg in messages)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "RAG query prepared",
                    stage="rag_query",
                    duration_ms=0,
                    rag_query=rag_query_str,
                    counts={"message_count": len(messages)},
                    rewritten_query=rewritten_query,
                )
            ),
        )

        answer_parts: list[str] = []
        token_count = 0

        generation_started_at = perf_counter()
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Generating answer",
                    stage="generation",
                    duration_ms=elapsed_ms(generation_started_at),
                    model=settings.llm_model,
                    counts={"input_messages": len(messages)},
                    rewritten_query=rewritten_query,
                    rag_query=rag_query_str,
                )
            ),
        )

        for token in model.stream(messages):
            if not token:
                continue

            answer_parts.append(token)
            token_count += 1
            yield sse_event("token", token)

        answer = "".join(answer_parts)
        yield sse_event(
            "step",
            json.dumps(
                step_payload(
                    "Answer complete",
                    stage="generation",
                    duration_ms=elapsed_ms(generation_started_at),
                    model=settings.llm_model,
                    counts={"tokens": token_count, "output_chars": len(answer)},
                    rewritten_query=rewritten_query,
                )
            ),
        )
        notify_sales_assistant_event(
            query=normalized_query,
            answer=answer,
            count=len(packed_results),
            top_n=safe_top_n,
            retrieval_k=retrieval_k,
            settings=settings,
        )
        yield sse_event(
            "sources",
            json.dumps(
                {
                    "query": normalized_query,
                    "rewritten_query": rewritten_query,
                    "count": len(packed_results),
                    "results": packed_results,
                    "top_n": safe_top_n,
                    "retrieval_k": retrieval_k,
                    "raw_count": len(raw_candidates),
                    "rewritten_count": len(rewritten_candidates),
                    "merged_count": len(merged_candidates),
                    "reranked_count": len(reranked_results),
                }
            ),
        )
        yield sse_event("done", "")
    except Exception as error:
        notify_sales_assistant_error(
            query=normalized_query,
            error_message=str(error),
            settings=settings,
        )
        yield sse_event("error", str(error))
        raise


def load_system_prompt(path: Path) -> str:
    """Load the sales assistant system prompt from disk."""

    return path.read_text(encoding="utf-8").strip()


def rewrite_query(
    query: str,
    *,
    settings: Settings,
    system_prompt: str | None = None,
    prompt_template: str | None = None,
) -> str:
    """Rewrite a user query for retrieval without changing its meaning."""

    query_rewrite_system_prompt = system_prompt or load_system_prompt(settings.instructions_root / QUERY_REWRITE_SYSTEM_PROMPT_FILE)
    query_rewrite_template = prompt_template or load_system_prompt(settings.instructions_root / QUERY_REWRITE_TEMPLATE_FILE)
    rewrite_model = create_chat_model(settings)
    rewrite_messages = ChatPromptTemplate.from_messages(
        [
            ("system", query_rewrite_system_prompt),
            ("human", query_rewrite_template),
        ]
    ).format_messages(query=query)
    response = rewrite_model.invoke(rewrite_messages)
    return deduplicate_query(response.content.strip())


def deduplicate_query(text: str) -> str:
    """Deduplicate repetitive query text from the rewrite step."""

    if not text:
        return text

    parts = re.split(r"[\?\.]\s*", text)
    seen: set[str] = set()
    unique: list[str] = []

    for part in parts:
        normalized = part.strip().lower()
        if not normalized:
            continue

        base = re.sub(r"\'s\b|\bwhat is the|\bwhat does|\bhow does|\bcan you", "", normalized).strip()
        if base in seen:
            continue

        seen.add(base)
        unique.append(part.strip())

    final = "? ".join(unique[:5])
    return final + "?" if not final.endswith(("?", ".")) else final


def build_no_context_payload(
    query: str,
    rewritten_query: str,
    search_payload: dict[str, object],
    *,
    settings: Settings,
) -> dict[str, object]:
    """Build a fallback response when no result passes rerank filtering."""

    return {
        "query": query,
        "rewritten_query": rewritten_query,
        "answer": load_system_prompt(settings.instructions_root / NO_CONTEXT_RESPONSE_FILE),
        "count": 0,
        "results": [],
        "top_n": search_payload["top_n"],
        "retrieval_k": search_payload["retrieval_k"],
        "raw_count": search_payload.get("raw_count", 0),
        "rewritten_count": search_payload.get("rewritten_count", 0),
        "merged_count": search_payload.get("merged_count", 0),
        "reranked_count": search_payload.get("reranked_count", 0),
    }


def build_answer_sources(results: list[dict[str, object]]) -> list[dict[str, object]]:
    """Build compact source metadata for citations and evaluations."""

    sources: list[dict[str, object]] = []
    for result in results:
        sources.append(
            {
                "title": result.get("title", ""),
                "path": result.get("path", ""),
                "source_uri": result.get("source_uri", result.get("path", "")),
                "content_type": result.get("content_type", ""),
                "section_title": result.get("section_title", ""),
                "relevance": result.get("relevance", 0.0),
                "rerank_score": result.get("rerank_score", 0.0),
                "boost": result.get("boost", 1.0),
                "boosted_score": result.get("boosted_score", result.get("rerank_score", 0.0)),
            }
        )
    return sources


def build_context(
    results: list[dict[str, object]],
    *,
    query: str,
    system_prompt: str,
    user_prompt_template: str,
    settings: Settings,
) -> tuple[str, dict[str, int], list[dict[str, object]]]:
    """Pack retrieved context into the available model context budget."""

    prompt_overhead_tokens = estimate_tokens(system_prompt) + estimate_tokens(user_prompt_template.format(query=query, context=""))
    budget_tokens = max(
        0,
        settings.chat_model_context_tokens - settings.chat_max_tokens - settings.chat_context_reserved_tokens - prompt_overhead_tokens,
    )

    if not results or budget_tokens <= 0:
        return (
            "No matching portfolio context could be packed within the context budget.",
            {
                "budget_tokens": budget_tokens,
                "used_tokens": 0,
                "included_chunks": 0,
                "skipped_chunks": len(results),
                "truncated_chunks": 0,
            },
            [],
        )

    sections: list[str] = []
    packed_results: list[dict[str, object]] = []
    used_tokens = 0
    included_chunks = 0
    skipped_chunks = 0
    truncated_chunks = 0
    separator = "\n\n---\n\n"

    for index, result in enumerate(results, start=1):
        section = format_context_result(index, result)
        prefix = separator if sections else ""
        candidate = prefix + section
        candidate_tokens = estimate_tokens(candidate)

        if used_tokens + candidate_tokens <= budget_tokens:
            sections.append(section)
            packed_results.append(dict(result))
            used_tokens += candidate_tokens
            included_chunks += 1
            continue

        remaining_tokens = budget_tokens - used_tokens - estimate_tokens(prefix)
        if remaining_tokens <= 32:
            skipped_chunks += 1
            continue

        truncated_section = truncate_text(section, remaining_tokens)
        if truncated_section:
            sections.append(truncated_section)
            truncated_result = dict(result)
            truncated_result["content"] = truncated_result["content"][: len(truncated_section)]
            packed_results.append(truncated_result)
            used_tokens += estimate_tokens(prefix + truncated_section)
            included_chunks += 1
            truncated_chunks += 1
        else:
            skipped_chunks += 1
        break

    skipped_chunks += max(0, len(results) - included_chunks)

    if not sections:
        return (
            "No matching portfolio context could be packed within the context budget.",
            {
                "budget_tokens": budget_tokens,
                "used_tokens": 0,
                "included_chunks": 0,
                "skipped_chunks": len(results),
                "truncated_chunks": 0,
            },
            [],
        )

    return (
        separator.join(sections),
        {
            "budget_tokens": budget_tokens,
            "used_tokens": used_tokens,
            "included_chunks": included_chunks,
            "skipped_chunks": skipped_chunks,
            "truncated_chunks": truncated_chunks,
        },
        packed_results,
    )


def format_context(results: object) -> str:
    """Format retrieved search results into prompt context."""

    if not isinstance(results, list) or not results:
        return "No matching portfolio context was found."

    sections: list[str] = []
    for index, result in enumerate(results, start=1):
        if not isinstance(result, dict):
            continue

        sections.append(format_context_result(index, result))

    return "\n\n---\n\n".join(sections)


def format_context_result(index: int, result: dict[str, object]) -> str:
    """Format one retrieved result into prompt context."""

    title = str(result.get("title", "Untitled")).strip()
    content_type = str(result.get("content_type", "unknown")).strip()
    path = str(result.get("path", "")).strip()
    content = str(result.get("content", "")).strip()
    relevance = result.get("relevance")
    metadata = summarize_metadata(result)

    return "\n".join(
        [
            f"Result {index}",
            f"Title: {title}",
            f"Type: {content_type}",
            f"Path: {path}",
            f"Relevance: {relevance}%" if relevance is not None else "Relevance: n/a",
            f"Metadata: {metadata}" if metadata else "Metadata:",
            "Content:",
            content,
        ]
    )


def summarize_metadata(result: dict[str, object]) -> str:
    """Summarize selected metadata fields for prompt context."""

    keys = [
        "summary",
        "question",
        "category",
        "status",
        "audience",
        "organization",
        "role",
        "tags",
        "technologies",
        "skills",
        "keywords",
    ]
    parts: list[str] = []
    for key in keys:
        value = result.get(key)
        if value in (None, "", []):
            continue
        parts.append(f"{key}={value}")
    return "; ".join(parts)


def sse_event(event: str, data: str) -> str:
    """Format a server-sent event frame."""

    lines = [f"event: {event}"]
    if data:
        for line in data.split("\n") or [""]:
            lines.append(f"data: {line}")
    else:
        lines.append("data:")
    return "\n".join(lines) + "\n\n"


def step_payload(
    message: str,
    *,
    stage: str,
    duration_ms: int,
    model: str | None = None,
    rewritten_query: str | None = None,
    counts: dict[str, object] | None = None,
    rag_query: str | None = None,
    debug: dict[str, object] | None = None,
) -> dict[str, object]:
    """Build a structured status payload for the UI."""

    payload: dict[str, object] = {
        "stage": stage,
        "message": message,
        "duration_ms": duration_ms,
    }
    if model:
        payload["model"] = model
    if rewritten_query:
        payload["rewritten_query"] = rewritten_query
    if rag_query:
        payload["rag_query"] = rag_query
    if counts:
        payload["counts"] = counts
    if debug:
        payload["debug"] = debug
    return payload


def elapsed_ms(started_at: float) -> int:
    """Convert elapsed perf_counter seconds to milliseconds."""

    return max(0, int((perf_counter() - started_at) * 1000))


def estimate_tokens(text: str) -> int:
    """Estimate tokens without an external tokenizer dependency."""

    return ceil(len(text) / 4)


def truncate_text(text: str, token_budget: int) -> str:
    """Truncate text to fit an estimated token budget."""

    if token_budget <= 0:
        return ""

    max_chars = token_budget * 4
    if len(text) <= max_chars:
        return text

    truncated = text[: max(0, max_chars - len("\n...[truncated]"))].rstrip()
    if not truncated:
        return ""
    return f"{truncated}\n...[truncated]"


def compute_vector_stats(vector: list[float]) -> dict[str, object]:
    """Compute debug stats for a vector embedding."""

    if not vector:
        return {"dimension": 0}

    norm = (sum(v * v for v in vector[:256])) ** 0.5
    return {
        "dimension": len(vector),
        "l2_norm": round(norm, 4),
        "first_5": [round(v, 6) for v in vector[:5]],
    }


def build_candidate_summary(candidate: dict[str, object]) -> dict[str, object]:
    """Build a debug summary for one retrieval candidate."""

    content = str(candidate.get("content", "")).strip()
    return {
        "title": str(candidate.get("title", "")).strip(),
        "path": str(candidate.get("path", "")).strip(),
        "relevance": float(candidate.get("relevance", 0.0)),
        "rerank_score": float(candidate.get("rerank_score", 0.0)),
        "boost": float(candidate.get("boost", 1.0)),
        "metadata_boost": float(candidate.get("metadata_boost", candidate.get("boost", 1.0))),
        "boosted_score": float(candidate.get("boosted_score", candidate.get("rerank_score", 0.0))),
        "content_preview": content[:120] + "..." if len(content) > 120 else content,
    }


def summarize_candidates(candidates: list[dict[str, object]], max_items: int = 6) -> list[dict[str, object]]:
    """Build a truncated list of candidate debug summaries."""

    summaries = [build_candidate_summary(c) for c in candidates]
    if len(summaries) > max_items:
        summaries = summaries[:max_items]
        summaries.append({"note": f"+ {len(candidates) - max_items} more not shown"})
    return summaries
