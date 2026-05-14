from fastapi import APIRouter

from api.routes import health, root

router = APIRouter()
router.include_router(root.router)
router.include_router(health.router)
