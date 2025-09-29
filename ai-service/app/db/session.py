from collections.abc import AsyncGenerator
import logging
import os

from pydantic import SecretStr
from sqlalchemy import text  # type: ignore[import]
from sqlalchemy.exc import OperationalError  # type: ignore[import]
from sqlalchemy.ext.asyncio import (  # type: ignore[import]
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

_engine: AsyncEngine | None = None
_SessionLocal: async_sessionmaker[AsyncSession] | None = None
_connection_verified = False

logger = logging.getLogger(__name__)

_DEFAULT_SQLITE_URL = "sqlite+aiosqlite:///./aksara_fallback.db"


def _sqlite_fallback_url() -> str:
    return os.getenv("SQLITE_FALLBACK_URL", _DEFAULT_SQLITE_URL)


def _ensure_engine(database_url: str | None = None) -> AsyncEngine:
    """Create an async engine (replacing any existing one)."""

    global _engine, _SessionLocal
    if database_url is None:
        database_url = get_settings().database_url.get_secret_value()

    if _engine is not None:
        try:
            _engine.sync_engine.dispose()
        except Exception:  # pragma: no cover - defensive cleanup
            logger.exception("engine_dispose_failed")

    _engine = create_async_engine(
        database_url,
        future=True,
        pool_pre_ping=True,
    )
    _SessionLocal = async_sessionmaker(
        bind=_engine,
        expire_on_commit=False,
    )
    return _engine


def _activate_sqlite_fallback(error: Exception) -> None:
    """Switch the connection to a local SQLite database when Postgres is unavailable."""

    global _connection_verified
    fallback_url = _sqlite_fallback_url()
    logger.warning(
        "database_fallback_sqlite",
        extra={
            "fallback_url": fallback_url,
            "error": str(error),
        },
    )

    os.environ.setdefault("DATABASE_URL", fallback_url)

    settings = get_settings()
    try:
        object.__setattr__(settings, "database_url", SecretStr(fallback_url))
    except Exception:  # pragma: no cover - pydantic version differences
        logger.debug("settings_update_failed", exc_info=True)

    _connection_verified = False
    _ensure_engine(fallback_url)


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        _ensure_engine()
    assert _engine is not None
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _SessionLocal
    if _SessionLocal is None:
        _ensure_engine()
    assert _SessionLocal is not None
    return _SessionLocal


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    global _connection_verified
    sessionmaker = get_sessionmaker()
    session = sessionmaker()
    if not _connection_verified:
        try:
            await session.execute(text("SELECT 1"))
        except OperationalError as exc:
            await session.close()
            _activate_sqlite_fallback(exc)
            sessionmaker = get_sessionmaker()
            session = sessionmaker()
            await session.execute(text("SELECT 1"))
        _connection_verified = True
    try:
        yield session
    finally:
        await session.close()
