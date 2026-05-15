from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from api.core.config import get_settings
from api.core.sales_assistant import stream_answer_query

router = APIRouter(tags=["sales-assistant"])


@router.get("/sales-assistant")
def sales_assistant(
    query: str,
    top_n: int | None = Query(default=None, ge=1),
) -> StreamingResponse:
    """Answer a user query using retrieved portfolio context."""

    settings = get_settings()
    resolved_top_n = top_n or settings.assistant_top_n
    return StreamingResponse(stream_answer_query(query, top_n=resolved_top_n), media_type="text/event-stream")
