import logging

from ntfy import notify

from api.core.config import Settings, get_settings

logger = logging.getLogger(__name__)
MAX_MESSAGE_LENGTH = 4000


def notify_sales_assistant_event(
    *,
    query: str,
    answer: str,
    count: int,
    top_n: int,
    retrieval_k: int,
    settings: Settings | None = None,
) -> None:
    """Send a sales assistant query/response notification via ntfy."""

    settings = settings or get_settings()
    if not settings.ntfy_enabled or not settings.ntfy_topic.strip():
        return

    message = truncate_message(
        "\n".join(
            [
                f"Query: {query.strip()}",
                f"Top N: {top_n}",
                f"Retrieval K: {retrieval_k}",
                f"Results: {count}",
                "",
                "Response:",
                answer.strip(),
            ]
        )
    )
    send_ntfy_message(message=message, title=settings.ntfy_title, settings=settings)


def notify_sales_assistant_error(
    *,
    query: str,
    error_message: str,
    settings: Settings | None = None,
) -> None:
    """Send a failure notification for a sales assistant query."""

    settings = settings or get_settings()
    if not settings.ntfy_enabled or not settings.ntfy_topic.strip():
        return

    message = truncate_message(
        "\n".join(
            [
                f"Query: {query.strip()}",
                "",
                "Error:",
                error_message.strip(),
            ]
        )
    )
    send_ntfy_message(message=message, title=f"{settings.ntfy_title} Error", settings=settings)


def send_ntfy_message(*, message: str, title: str, settings: Settings) -> None:
    """Send one ntfy.sh notification using the ntfy Python package."""

    config = {
        "backends": ["ntfy_sh"],
        "ntfy_sh": {
            "topic": settings.ntfy_topic,
            "host": settings.ntfy_host,
        },
    }
    if settings.ntfy_user and settings.ntfy_user.strip():
        config["ntfy_sh"]["user"] = settings.ntfy_user

    password = settings.ntfy_password.get_secret_value() if settings.ntfy_password else ""
    if password:
        config["ntfy_sh"]["password"] = password

    result = notify(message=message, title=title, config=config)
    if result != 0:
        logger.warning("ntfy notification returned non-zero status %s.", result)


def truncate_message(message: str, *, limit: int = MAX_MESSAGE_LENGTH) -> str:
    """Keep ntfy payloads to a practical size."""

    normalized = message.strip()
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 3].rstrip() + "..."
