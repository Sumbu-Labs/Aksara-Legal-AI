from __future__ import annotations

import io
from collections.abc import Iterable

import httpx
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

from app.core.logging import get_logger

logger = get_logger(__name__)


async def fetch_pdf(url: str, timeout: float) -> bytes:
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content


def pdf_to_markdown(data: bytes) -> str:
    output = io.StringIO()
    laparams = LAParams()
    extract_text_to_fp(io.BytesIO(data), output, laparams=laparams, output_type="text")
    text = output.getvalue()
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def chunk_pages(text: str) -> Iterable[tuple[str, str]]:
    for idx, page in enumerate(text.split("\f"), start=1):
        cleaned = page.strip()
        if cleaned:
            yield f"Halaman {idx}", cleaned
