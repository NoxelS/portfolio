from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.core.config import Settings, get_settings
from api.core.logging import configure_logging
from api.routes import router


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = settings or get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.app_name,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    app.include_router(router)

    return app


app = create_app()
