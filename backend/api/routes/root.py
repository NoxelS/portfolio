from fastapi import APIRouter

router = APIRouter(tags=["root"])


@router.get("/")
def read_root() -> dict[str, str]:
    """Return basic API metadata."""

    return {"service": "portfolio-api"}
