from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    """Return a lightweight readiness response."""

    return {"status": "ok", "service": "portfolio-api"}
