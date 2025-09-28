from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

_engine: AsyncEngine | None = None
_SessionLocal: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url.get_secret_value(),
            future=True,
            pool_pre_ping=True,
        )
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = async_sessionmaker(
            bind=get_engine(),
            expire_on_commit=False,
        )
    return _SessionLocal


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    session = get_sessionmaker()()
    try:
        yield session
    finally:
        await session.close()
