"""Helpers for applying database migrations at runtime."""
from __future__ import annotations

import asyncio
from pathlib import Path

from alembic import command
from alembic.config import Config

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_ALEMBIC_INI_PATH = _PROJECT_ROOT / "alembic.ini"
_ALEMBIC_SCRIPT_LOCATION = _PROJECT_ROOT / "alembic"

_migration_lock = asyncio.Lock()
_migrations_applied = False


async def apply_migrations() -> None:
    """Apply Alembic migrations up to the latest revision.

    The function is safe to call multiple times; the underlying migration
    command will only run once per process thanks to the lock & guard flag.
    """

    global _migrations_applied
    if _migrations_applied:
        return

    async with _migration_lock:
        if _migrations_applied:
            return

        settings = get_settings()
        alembic_cfg = Config(str(_ALEMBIC_INI_PATH))
        alembic_cfg.set_main_option("script_location", str(_ALEMBIC_SCRIPT_LOCATION))
        alembic_cfg.set_main_option(
            "sqlalchemy.url", settings.database_url.get_secret_value()
        )

        logger.info("migrations_applying")
        await asyncio.to_thread(command.upgrade, alembic_cfg, "head")
        logger.info("migrations_applied")

        _migrations_applied = True
