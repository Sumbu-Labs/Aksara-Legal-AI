from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import MissingFieldError
from app.core.logging import get_logger
from app.models import AutopilotJob, AutopilotJobStatus
from app.services.autopilot.mapping import FieldMapper
from app.services.autopilot.renderer.service import DocumentRenderer
from app.services.autopilot.resolver.service import FieldResolver
from app.services.autopilot.templates.service import TemplateService
from app.services.autopilot.validators.fields import FieldValidator

logger = get_logger(__name__)


@dataclass
class AutopilotContext:
    business_profile: dict[str, Any]
    uploaded_docs: list[dict[str, Any]]
    options: dict[str, Any]


class AutopilotService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.settings = get_settings()
        self.templates = TemplateService(session)
        self.renderer = DocumentRenderer()

    async def generate(self, payload: dict[str, Any]) -> dict[str, Any]:
        permit_type = payload["permit_type"]
        region = payload.get("region", "DIY")
        business_profile = payload.get("business_profile", {})
        uploaded_docs = payload.get("uploaded_docs", [])
        options = payload.get("options", {})
        user_id = payload.get("user_id", "unknown")

        schema = await self.templates.get_schema(permit_type, region)
        if schema is None:
            raise MissingFieldError("Template schema unavailable")

        mapper = FieldMapper(schema)
        mapped_fields = mapper.apply(business_profile, uploaded_docs)

        validator = FieldValidator(schema)
        missing = validator.find_missing(mapped_fields)

        resolver = FieldResolver(schema, mapped_fields)
        context = {
            "permit_type": permit_type,
            "region": region,
            "business_profile": business_profile,
            "uploaded_docs": uploaded_docs,
        }
        resolved_records = await resolver.resolve(missing, context)
        resolved_map: dict[str, dict[str, Any]] = {}
        for record in resolved_records:
            field_key = record.get("field")
            if isinstance(field_key, str):
                resolved_map[field_key] = record

        for field, record in resolved_map.items():
            value = record.get("value")
            source_type = record.get("source_type", "model_inference")
            if source_type == "model_inference" and (value is None or value == ""):
                continue
            mapped_fields[field] = value

        missing_after = validator.find_missing(mapped_fields)
        if missing_after:
            guidance = validator.guidance(missing_after)
            await self._record_job(
                user_id=user_id,
                permit_type=permit_type,
                region=region,
                input_payload=payload,
                status=AutopilotJobStatus.MISSING,
                field_audit=None,
                doc_url=None,
                pdf_url=None,
            )
            return {
                "status": "missing_required_fields",
                "missing_fields": missing_after,
                "guidance": guidance,
            }

        template_url = schema.get("metadata", {}).get("docx_template_url")
        if not template_url:
            raise MissingFieldError("Template URL missing")

        docx_bytes = await self.renderer.render_docx(template_url, mapped_fields)
        pdf_bytes = None
        if options.get("format") == "pdf" and self.settings.enable_pdf_export:
            try:
                pdf_bytes = await self.renderer.maybe_convert_pdf(docx_bytes)
            except Exception as exc:
                logger.warning("pdf_conversion_failed", error=str(exc))

        outputs = await self.renderer.persist_outputs(
            f"{permit_type.lower()}-{user_id}", docx_bytes, pdf_bytes
        )

        field_audit: dict[str, Any] = {}
        for field, value in mapped_fields.items():
            source = self._determine_source(field, business_profile, uploaded_docs, resolved_map)
            resolved_entry = resolved_map.get(field, {})
            source_type = str(resolved_entry.get("source_type", source))
            field_audit[field] = {
                "value": value,
                "source": source,
                "source_type": source_type,
                "rationale": resolved_entry.get("rationale"),
            }

        await self._record_job(
            user_id=user_id,
            permit_type=permit_type,
            region=region,
            input_payload=payload,
            status=AutopilotJobStatus.COMPLETED,
            field_audit=field_audit,
            doc_url=outputs.get("doc_url"),
            pdf_url=outputs.get("pdf_url"),
        )

        response = {
            "status": "ok",
            "field_audit": field_audit,
            "model_meta": {"model": self.settings.gemini_model_qa},
        }
        response.update(outputs)
        return response

    def _determine_source(
        self,
        field: str,
        business_profile: dict[str, Any],
        uploaded_docs: list[dict[str, Any]],
        resolved_map: dict[str, dict[str, Any]],
    ) -> str:
        if field in business_profile:
            return "profile"
        for doc in uploaded_docs:
            doc_fields = doc.get("fields")
            if isinstance(doc_fields, dict) and field in doc_fields:
                return "doc"
        if field in resolved_map:
            source_value = resolved_map[field].get("source_type", "model_inference")
            return str(source_value)
        return "model_inference"

    async def _record_job(
        self,
        user_id: str,
        permit_type: str,
        region: str,
        input_payload: dict[str, Any],
        status: AutopilotJobStatus,
        field_audit: dict[str, Any] | None,
        doc_url: str | None,
        pdf_url: str | None,
    ) -> None:
        job = AutopilotJob(
            user_id=user_id,
            permit_type=permit_type,
            region=region,
            input_json=input_payload,
            field_audit=field_audit,
            status=status,
            doc_url=doc_url,
            pdf_url=pdf_url,
        )
        self.session.add(job)
        await self.session.commit()
