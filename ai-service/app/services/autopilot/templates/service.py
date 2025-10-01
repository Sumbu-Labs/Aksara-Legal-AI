from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models import Template
from app.services.autopilot.templates.fallback import get_fallback_schema


class TemplateTableMissingError(RuntimeError):
    """Raised when the backing `templates` table is unavailable."""


def _is_missing_table_error(error: Exception) -> bool:
    """Best-effort detection for "relation does not exist" errors.

    Works across psycopg 3 and SQLAlchemy wrappers.
    """

    cause = getattr(error, "orig", None)
    if cause is None:
        return False

    # psycopg3 raises a dedicated UndefinedTable error.
    try:  # pragma: no cover - optional dependency awareness
        from psycopg.errors import UndefinedTable  # type: ignore
    except Exception:  # pragma: no cover
        UndefinedTable = None  # type: ignore

    if UndefinedTable is not None and isinstance(cause, UndefinedTable):
        return True

    message = str(cause).lower()
    return "undefined table" in message or "relation" in message and "does not exist" in message

logger = get_logger(__name__)


class TemplateService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.settings = get_settings()

    async def get_template(self, permit_type: str, region: str) -> Template | None:
        stmt = select(Template).where(
            Template.permit_type == permit_type,
            Template.region == region,
        )
        try:
            result = await self.session.execute(stmt)
        except (ProgrammingError, OperationalError) as error:
            if _is_missing_table_error(error):
                raise TemplateTableMissingError from error
            raise
        template = result.scalar_one_or_none()
        if template is None:
            logger.warning("template_not_found", permit_type=permit_type, region=region)
        return template

    async def get_schema(self, permit_type: str, region: str) -> dict[str, Any] | None:
        try:
            template = await self.get_template(permit_type, region)
        except TemplateTableMissingError:
            logger.warning(
                "template_table_missing_fallback",
                permit_type=permit_type,
                region=region,
            )
            return get_fallback_schema(permit_type, region)

        if not template:
            fallback = get_fallback_schema(permit_type, region)
            if fallback:
                logger.info(
                    "template_fallback_returned",
                    permit_type=permit_type,
                    region=region,
                    reason="not_found",
                )
            return fallback

        schema: dict[str, Any] = dict(template.json_schema)
        metadata: dict[str, Any] = dict(schema.get("metadata", {}))
        metadata["html_template_url"] = template.html_template_url
        metadata["version_date"] = template.version_date.isoformat()
        schema["metadata"] = metadata
        return schema
