from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from api.core.sales_assistant import DEFAULT_ASSISTANT_TOP_N, stream_answer_query
from api.core.search import MAX_TOP_N

router = APIRouter(tags=["sales-assistant"])


@router.get("/sales-assistant")
def sales_assistant(
    query: str,
    top_n: int = Query(default=DEFAULT_ASSISTANT_TOP_N, ge=1, le=MAX_TOP_N),
) -> StreamingResponse:
    """Answer a user query using retrieved portfolio context."""

    return StreamingResponse(stream_answer_query(query, top_n=top_n), media_type="text/event-stream")
