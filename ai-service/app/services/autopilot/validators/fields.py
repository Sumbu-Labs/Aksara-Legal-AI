from __future__ import annotations

from typing import Any


class FieldValidator:
    def __init__(self, schema: dict[str, Any]) -> None:
        self.schema = schema
        self.required_fields = schema.get("required", [])
        self.properties = schema.get("properties", {})

    def find_missing(self, data: dict[str, Any]) -> list[str]:
        missing: list[str] = []
        for field in self.required_fields:
            if not self._has_value(data, field):
                missing.append(field)
        return missing

    def _has_value(self, data: dict[str, Any], field: str) -> bool:
        value = data.get(field)
        if value is None:
            return False
        if isinstance(value, str) and not value.strip():
            return False
        if isinstance(value, (list, dict)) and len(value) == 0:
            return False
        return True

    def guidance(self, missing: list[str]) -> str:
        hints: list[str] = []
        for field in missing:
            prop = self.properties.get(field, {})
            description = prop.get("description", "Informasi belum tersedia")
            example = prop.get("examples", [None])[0]
            hint = f"{field}: {description}"
            if example:
                hint += f" (contoh: {example})"
            hints.append(hint)
        return "; ".join(hints)
