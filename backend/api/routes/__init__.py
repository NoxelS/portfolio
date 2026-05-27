from fastapi import APIRouter

from api.routes import health, rag_evaluations, root, sales_assistant

router = APIRouter()
router.include_router(root.router)
router.include_router(health.router)
router.include_router(rag_evaluations.router)
router.include_router(sales_assistant.router)
