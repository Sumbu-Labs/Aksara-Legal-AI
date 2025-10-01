"""Static fallback schemas for Autopilot templates.

These ensure the API can respond with sensible defaults even when the
`templates` table has not been provisioned yet (for demo or local setups).
"""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

_FALLBACK_UPLOAD_FIELDS: list[dict[str, Any]] = [
    {
        "id": "label",
        "label": "Nama Dokumen",
        "description": "Nama tampilan yang akan muncul di daftar dokumen.",
        "type": "text",
        "required": True,
    },
    {
        "id": "permitType",
        "label": "Jenis Perizinan",
        "description": "Pilih jenis perizinan yang terkait dengan dokumen ini.",
        "type": "select",
        "required": False,
        "options": [
            {"value": "HALAL", "label": "Halal"},
            {"value": "PIRT", "label": "PIRT"},
            {"value": "BPOM", "label": "BPOM"},
        ],
    },
    {
        "id": "description",
        "label": "Deskripsi Dokumen",
        "description": "Instruksi singkat tentang dokumen yang diunggah.",
        "type": "textarea",
        "required": False,
    },
]


_BASE_FALLBACK_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Fallback Autopilot Template",
    "type": "object",
    "metadata": {
        "provider": "static-fallback",
        "html_template_url": None,
        "version_date": datetime(2024, 1, 1, tzinfo=timezone.utc).isoformat(),
        "upload_fields": _FALLBACK_UPLOAD_FIELDS,
    },
    "documents": {
        "fields": _FALLBACK_UPLOAD_FIELDS,
    },
    "properties": {
        "label": {
            "type": "string",
            "title": "Nama Dokumen",
            "description": "Nama tampilan yang akan muncul di daftar dokumen.",
        },
        "permitType": {
            "type": "string",
            "title": "Jenis Perizinan",
            "enum": ["HALAL", "PIRT", "BPOM"],
        },
        "description": {
            "type": "string",
            "title": "Deskripsi Dokumen",
        },
    },
    "required": ["label"],
}


def get_fallback_schema(permit_type: str, region: str) -> dict[str, Any] | None:
    """Return a defensive fallback schema for supported permit types.

    The frontend only needs a consistent structure containing upload field
    metadata. Returning this structure keeps the demo experience working when
    the relational table is absent.
    """

    normalized_permit = permit_type.upper()
    if normalized_permit not in {"PIRT", "HALAL", "BPOM"}:
        return None

    schema = deepcopy(_BASE_FALLBACK_SCHEMA)
    schema["metadata"] = {
        **schema["metadata"],
        "permit_type": normalized_permit,
        "region": region,
    }
    schema.setdefault("definitions", {})
    schema["definitions"].update(
        {
            "permit_type": normalized_permit,
            "region": region,
        }
    )
    return schema
