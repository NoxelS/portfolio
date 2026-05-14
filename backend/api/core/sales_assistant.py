from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate

from api.core.config import Settings, get_settings
from api.core.model_client import create_chat_model
from api.core.ntfy_logger import notify_sales_assistant_error, notify_sales_assistant_event
from api.core.search import search_content

DEFAULT_ASSISTANT_TOP_N = 5
SYSTEM_PROMPT_FILE = "sales-assistant.md"


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
        context = format_context(results)

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                (
                    "human",
                    "User query:\n{query}\n\n"
                    "Portfolio context:\n{context}\n\n"
                    "Answer the user using the context above.",
                ),
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
