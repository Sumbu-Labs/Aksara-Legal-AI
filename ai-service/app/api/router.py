from fastapi import APIRouter

from app.api.v1 import autopilot, health, ingest, qa, templates

router = APIRouter()
router.include_router(qa.router)
router.include_router(autopilot.router)
router.include_router(templates.router)
router.include_router(ingest.router)
router.include_router(health.router)
