from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text

from app.api.deps import get_db_session
from app.models import Chunk
from app.schemas.health import HealthStatus
from app.services.llm.gemini import get_gemini_client

router = APIRouter(prefix="/v1/health", tags=["health"])


@router.get("", response_model=HealthStatus)
async def health_check(session=Depends(get_db_session)) -> HealthStatus:
    details: dict[str, str] = {}

    try:
        await session.execute(text("SELECT 1"))
        details["db"] = "ok"
    except Exception as exc:
        details["db"] = f"error: {exc}"

    try:
        result = await session.execute(select(func.count()).select_from(Chunk))
        count = result.scalar_one()
        details["rag"] = "ok" if count and count > 0 else "empty"
    except Exception as exc:
        details["rag"] = f"error: {exc}"

    try:
        client = get_gemini_client()
        if client is None:
            raise RuntimeError("Gemini client unavailable")
        details["llm"] = "ok"
    except Exception as exc:
        details["llm"] = f"error: {exc}"

    status_value: Literal["ok", "error"] = (
        "ok" if all(value in {"ok", "empty"} for value in details.values()) else "error"
    )
    return HealthStatus(status=status_value, details=details)

