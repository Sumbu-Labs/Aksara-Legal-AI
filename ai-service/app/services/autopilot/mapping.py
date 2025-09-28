from __future__ import annotations

from typing import Any


class FieldMapper:
    def __init__(self, schema: dict[str, Any]) -> None:
        self.schema = schema

    def apply(self, business_profile: dict[str, Any], uploaded_docs: list[dict[str, Any]]) -> dict[str, Any]:
        properties = self.schema.get("properties", {})
        mapped: dict[str, Any] = {}
        for field in properties.keys():
            if field in business_profile:
                mapped[field] = business_profile[field]
        for doc in uploaded_docs:
            doc_fields = doc.get("fields", {})
            for key, value in doc_fields.items():
                mapped.setdefault(key, value)
        return mapped
