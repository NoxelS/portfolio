from fastapi import APIRouter

from api.routes import debug, health, root

router = APIRouter()
router.include_router(root.router)
router.include_router(health.router)
router.include_router(debug.router)
