from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.services.autopilot.service import AutopilotService
from app.services.rag.pipeline.service import RagPipeline


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session


def get_rag_pipeline(session: AsyncSession = Depends(get_db_session)) -> RagPipeline:
    return RagPipeline(session)


def get_autopilot_service(session: AsyncSession = Depends(get_db_session)) -> AutopilotService:
    return AutopilotService(session)
