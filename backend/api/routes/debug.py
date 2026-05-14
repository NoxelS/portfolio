from fastapi import APIRouter, Query

from api.core.bootstrap import list_indexed_chunks
from api.core.search import search_content

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/embeddings")
def read_embeddings() -> dict[str, object]:
    """Return indexed Redis chunk documents for bootstrap inspection."""

    chunks = list_indexed_chunks()
    return {
        "count": len(chunks),
        "chunks": chunks,
    }


@router.get("/search")
def debug_search(
    query: str,
    top_n: int = Query(default=10, ge=1, le=25),
) -> dict[str, object]:
    """Search indexed content chunks and return reranked debug results."""

    return search_content(query, top_n=top_n)
