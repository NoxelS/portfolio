from fastapi import APIRouter

from api.core.bootstrap import list_indexed_chunks

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/embeddings")
def read_embeddings() -> dict[str, object]:
    """Return indexed Redis chunk documents for bootstrap inspection."""

    chunks = list_indexed_chunks()
    return {
        "count": len(chunks),
        "chunks": chunks,
    }
