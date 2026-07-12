from fastapi import APIRouter

from app.api.v1 import analyze, storage

router = APIRouter()

router.include_router(analyze.router, tags=["analyze"])
router.include_router(storage.router, prefix="/v1", tags=["storage"])