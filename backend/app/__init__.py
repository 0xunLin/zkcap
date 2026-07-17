from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.webhooks import router as webhook_router
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.attestations import router as attestations_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        description="Verifiable commit attestation protocol for private repositories.",
        version="0.1.0",
    )

    # CORS — allow frontend dev server and CLI
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health_router)
    app.include_router(webhook_router)
    app.include_router(auth_router)
    app.include_router(projects_router)
    app.include_router(attestations_router)

    return app


app = create_app()

