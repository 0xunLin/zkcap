from fastapi import APIRouter
from app.api.endpoints import projects, commits, attestations, webhooks, evaluation_callback
from app.api import auth

api_router = APIRouter()
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(commits.router, prefix="/commits", tags=["commits"])
api_router.include_router(attestations.router, prefix="/attestations", tags=["attestations"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(evaluation_callback.router, prefix="/evaluation", tags=["evaluation"])
api_router.include_router(auth.router)
