from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.config import get_settings
from app.models import Template

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
        result = await self.session.execute(stmt)
        template = result.scalar_one_or_none()
        if template is None:
            logger.warning("template_not_found", permit_type=permit_type, region=region)
        return template

    async def get_schema(self, permit_type: str, region: str) -> dict[str, Any] | None:
        template = await self.get_template(permit_type, region)
        if not template:
            return None
        schema = template.json_schema
        schema.setdefault("metadata", {})
        schema["metadata"]["docx_template_url"] = template.docx_template_url
        schema["metadata"]["version_date"] = template.version_date.isoformat()
        return schema
