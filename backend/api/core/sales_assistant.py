import json
from collections.abc import Iterator
from pathlib import Path
from time import perf_counter

from langchain_core.prompts import ChatPromptTemplate

from api.core.config import Settings, get_settings
from api.core.model_client import create_chat_model
from api.core.ntfy_logger import notify_sales_assistant_error, notify_sales_assistant_event
from api.core.search import MAX_RETRIEVAL_K, MAX_TOP_N, embed_query, rerank_candidates, search_content, search_knn

DEFAULT_ASSISTANT_TOP_N = 5
SYSTEM_PROMPT_FILE = "sales-assistant/system.md"
USER_PROMPT_TEMPLATE_FILE = "sales-assistant/user-template.md"


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
        search_payload = search_content(normalized_query, top_n=top_n, settings=settings)
        results = search_payload["results"]
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

        safe_top_n = max(1, min(top_n, MAX_TOP_N))
        retrieval_k = min(safe_top_n * 3, MAX_RETRIEVAL_K)

        embedding_started_at = perf_counter()
        query_vector = embed_query(normalized_query, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Embedding your query',
                    stage='embedding',
                    duration_ms=elapsed_ms(embedding_started_at),
                    model=settings.embedding_model,
                    counts={'input': 1},
                )
            ),
        )

        retrieval_started_at = perf_counter()
        candidates = search_knn(query_vector, retrieval_k=retrieval_k, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Retrieving chunks',
                    stage='retrieval',
                    duration_ms=elapsed_ms(retrieval_started_at),
                    counts={'retrieved': len(candidates), 'requested': retrieval_k},
                )
            ),
        )

        rerank_started_at = perf_counter()
        results = rerank_candidates(normalized_query, candidates, top_n=safe_top_n, settings=settings)
        yield sse_event(
            'step',
            json.dumps(
                step_payload(
                    'Reranking results',
                    stage='rerank',
                    duration_ms=elapsed_ms(rerank_started_at),
                    model=settings.reranker_model,
                    counts={'input': len(candidates), 'output': len(results), 'top_n': safe_top_n},
                )
            ),
        )

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
                    "count": len(results),
                    "results": results,
                    "top_n": safe_top_n,
                    "retrieval_k": retrieval_k,
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
    if counts:
        payload['counts'] = counts
    return payload


def elapsed_ms(started_at: float) -> int:
    """Convert elapsed perf_counter seconds to milliseconds."""

    return max(0, int((perf_counter() - started_at) * 1000))
