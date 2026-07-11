from fastapi import APIRouter

from app.api.v1 import analyze

router = APIRouter()

router.include_router(analyze.router, tags=["analyze"])