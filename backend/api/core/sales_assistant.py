import json
from collections.abc import Iterator
from pathlib import Path
from time import perf_counter

from langchain_core.prompts import ChatPromptTemplate

from api.core.config import Settings, get_settings
from api.core.model_client import create_chat_model
from api.core.ntfy_logger import notify_sales_assistant_error, notify_sales_assistant_event
from api.core.search import embed_query, filter_reranked_results, merge_candidates, rerank_candidates, search_content, search_knn

DEFAULT_ASSISTANT_TOP_N = 5
SYSTEM_PROMPT_FILE = "sales-assistant/system.md"
USER_PROMPT_TEMPLATE_FILE = "sales-assistant/user-template.md"
QUERY_REWRITE_SYSTEM_PROMPT_FILE = "sales-assistant/query-rewrite-system.md"
QUERY_REWRITE_TEMPLATE_FILE = "sales-assistant/query-rewrite.md"
NO_CONTEXT_RESPONSE_FILE = "sales-assistant/no-context-response.md"


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
        context = format_context(results)

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
            "count": len(results),
            "results": results,
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
            'step',
            json.dumps(
                step_payload(
                    'Starting query',
                    stage='query',
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
            'step',
            json.dumps(
                step_payload(
                    'Rewriting query',
                    stage='rewrite',
                    duration_ms=elapsed_ms(rewrite_started_at),
                    model=settings.llm_model,
                    rewritten_query=rewritten_query,
                    counts={'input_chars': len(normalized_query), 'output_chars': len(rewritten_query)},
                )
            ),
        )

        raw_embed_started_at = perf_counter()
        raw_query_vector = embed_query(normalized_query, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Embedding original query',
                    stage='embedding',
                    duration_ms=elapsed_ms(raw_embed_started_at),
                    model=settings.embedding_model,
                    counts={'input': 1},
                )
            ),
        )

        raw_retrieval_started_at = perf_counter()
        raw_candidates = search_knn(raw_query_vector, retrieval_k=retrieval_k, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Retrieving raw query chunks',
                    stage='retrieval',
                    duration_ms=elapsed_ms(raw_retrieval_started_at),
                    counts={'retrieved': len(raw_candidates), 'requested': retrieval_k},
                )
            ),
        )

        rewritten_embed_started_at = perf_counter()
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Embedding rewritten query',
                    stage='embedding',
                    duration_ms=elapsed_ms(rewritten_embed_started_at),
                    model=settings.embedding_model,
                    counts={'input': 1},
                    rewritten_query=rewritten_query,
                )
            ),
        )
        rewritten_query_vector = embed_query(rewritten_query, settings=settings)
        rewritten_retrieval_started_at = perf_counter()
        rewritten_candidates = search_knn(rewritten_query_vector, retrieval_k=retrieval_k, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Retrieving rewritten query chunks',
                    stage='retrieval',
                    duration_ms=elapsed_ms(rewritten_retrieval_started_at),
                    counts={'retrieved': len(rewritten_candidates), 'requested': retrieval_k},
                    rewritten_query=rewritten_query,
                )
            ),
        )

        merge_started_at = perf_counter()
        merged_candidates = merge_candidates(raw_candidates, rewritten_candidates)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Merging retrieval results',
                    stage='merge',
                    duration_ms=elapsed_ms(merge_started_at),
                    counts={'raw': len(raw_candidates), 'rewritten': len(rewritten_candidates), 'merged': len(merged_candidates)},
                    rewritten_query=rewritten_query,
                )
            ),
        )

        rerank_started_at = perf_counter()
        reranked_results = rerank_candidates(normalized_query, merged_candidates, top_n=safe_top_n, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Reranking results',
                    stage='rerank',
                    duration_ms=elapsed_ms(rerank_started_at),
                    model=settings.reranker_model,
                    counts={'input': len(merged_candidates), 'output': len(reranked_results), 'top_n': safe_top_n},
                    rewritten_query=rewritten_query,
                )
            ),
        )

        filter_started_at = perf_counter()
        results = filter_reranked_results(reranked_results, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Filtering low-confidence results',
                    stage='filter',
                    duration_ms=elapsed_ms(filter_started_at),
                    counts={
                        'input': len(reranked_results),
                        'kept': len(results),
                        'threshold': settings.reranker_minimum_relevance_percent,
                    },
                    rewritten_query=rewritten_query,
                )
            ),
        )

        if not results:
            fallback_answer = load_system_prompt(settings.instructions_root / NO_CONTEXT_RESPONSE_FILE)
            yield sse_event(
                'step',
                json.dumps(
                    step_payload(
                        'No relevant context found',
                        stage='fallback',
                        duration_ms=0,
                        counts={'threshold': settings.reranker_minimum_relevance_percent},
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
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Loading prompt',
                    stage='prompt',
                    duration_ms=0,
                    counts={'context_items': len(results)},
                )
            ),
        )
        context = format_context(results)

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", user_prompt_template),
            ]
        )
        messages = prompt.format_messages(query=normalized_query, context=context)
        model = create_chat_model(settings)
        answer_parts: list[str] = []
        token_count = 0

        generation_started_at = perf_counter()
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Generating answer',
                    stage='generation',
                    duration_ms=elapsed_ms(generation_started_at),
                    model=settings.llm_model,
                    counts={'input_messages': len(messages)},
                    rewritten_query=rewritten_query,
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
            'step',
            json.dumps(
                step_payload(
                    'Answer complete',
                    stage='generation',
                    duration_ms=elapsed_ms(generation_started_at),
                    model=settings.llm_model,
                    counts={'tokens': token_count, 'output_chars': len(answer)},
                    rewritten_query=rewritten_query,
                )
            ),
        )
        notify_sales_assistant_event(
            query=normalized_query,
            answer=answer,
            count=len(results),
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
                    "count": len(results),
                    "results": results,
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
    return response.content.strip()


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


def format_context(results: object) -> str:
    """Format retrieved search results into prompt context."""

    if not isinstance(results, list) or not results:
        return "No matching portfolio context was found."

    sections: list[str] = []
    for index, result in enumerate(results, start=1):
        if not isinstance(result, dict):
            continue

        title = str(result.get("title", "Untitled")).strip()
        content_type = str(result.get("content_type", "unknown")).strip()
        path = str(result.get("path", "")).strip()
        content = str(result.get("content", "")).strip()
        relevance = result.get("relevance")
        metadata = summarize_metadata(result)

        sections.append(
            "\n".join(
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
        )

    return "\n\n---\n\n".join(sections)


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
        for line in data.splitlines() or [""]:
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
) -> dict[str, object]:
    """Build a structured status payload for the UI."""

    payload: dict[str, object] = {
        'stage': stage,
        'message': message,
        'duration_ms': duration_ms,
    }
    if model:
        payload['model'] = model
    if rewritten_query:
        payload['rewritten_query'] = rewritten_query
    if counts:
        payload['counts'] = counts
    return payload


def elapsed_ms(started_at: float) -> int:
    """Convert elapsed perf_counter seconds to milliseconds."""

    return max(0, int((perf_counter() - started_at) * 1000))
