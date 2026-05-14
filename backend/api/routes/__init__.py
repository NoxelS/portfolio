from fastapi import APIRouter

from api.routes import debug, health, root, sales_assistant

router = APIRouter()
router.include_router(root.router)
router.include_router(health.router)
router.include_router(debug.router)
router.include_router(sales_assistant.router)
