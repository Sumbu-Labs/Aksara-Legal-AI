from __future__ import annotations

import json
from typing import Any

from app.core.logging import get_logger
from app.core.prompts import get_prompt
from app.services.llm.gemini import get_gemini_client

logger = get_logger(__name__)


class FieldResolver:
    def __init__(self, schema: dict[str, Any], known_mappings: dict[str, Any]) -> None:
        self.schema = schema
        self.known_mappings = known_mappings
        self.prompt = get_prompt("autopilot field-resolver prompt")
        self.gemini = get_gemini_client()

    async def resolve(self, missing_fields: list[str], context: dict[str, Any]) -> list[dict[str, Any]]:
        if not missing_fields:
            return []
        payload = {
            "permit_type": context.get("permit_type"),
            "region": context.get("region"),
            "business_profile": context.get("business_profile"),
            "uploaded_docs": context.get("uploaded_docs"),
            "form_schema": self.schema,
            "known_mappings": self.known_mappings,
            "missing_fields": missing_fields,
        }
        response = await self.gemini.call_resolver(self.prompt, payload)
        records = self._parse_response(response)
        return records

    def _parse_response(self, response: dict[str, Any]) -> list[dict[str, Any]]:
        try:
            text = response["candidates"][0]["content"]["parts"][0]["text"]
            data = json.loads(text)
            if isinstance(data, list):
                return [self._normalize(record) for record in data]
            if isinstance(data, dict):
                return [self._normalize(data)]
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
            logger.warning("field_resolver_parse_failed", error=str(exc), response=response)
        return []

    @staticmethod
    def _normalize(record: dict[str, Any]) -> dict[str, Any]:
        allowed_keys = {"field", "value", "rationale", "source_type"}
        return {key: record.get(key) for key in allowed_keys}
