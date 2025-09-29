from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, cast
from urllib.parse import urljoin, urlparse

import httpx
from jinja2 import BaseLoader, Environment, StrictUndefined, select_autoescape

try:  # pragma: no cover - optional dependency guard
    from weasyprint import HTML
except Exception:  # pragma: no cover - allow running without binary deps
    HTML = None  # type: ignore[assignment]

from app.core.config import get_settings
from app.core.errors import PdfExportError
from app.core.logging import get_logger
from app.services.storage.client import get_storage_client

logger = get_logger(__name__)


if TYPE_CHECKING:  # pragma: no cover
    from app.core.config import AppSettings
else:  # pragma: no cover
    AppSettings = Any


@dataclass(slots=True)
class RenderedDocument:
    html: str
    base_url: str | None


class DocumentRenderer:
    def __init__(self, settings: AppSettings | None = None) -> None:
        self.settings = settings or get_settings()
        self.storage = get_storage_client()
        self.jinja_env = Environment(
            loader=BaseLoader(),
            autoescape=select_autoescape(enabled_extensions=("html", "xml")),
            undefined=StrictUndefined,
        )

    async def render_html(self, template_url: str, context: dict[str, Any]) -> RenderedDocument:
        template_bytes = await self._download(template_url)
        template_source = template_bytes.decode("utf-8")
        base_url = self._derive_base_url(template_url)
        html_content = await asyncio.to_thread(self._render_html_sync, template_source, context)
        return RenderedDocument(html=html_content, base_url=base_url)

    async def _download(self, url: str) -> bytes:
        async with httpx.AsyncClient(timeout=self.settings.request_timeout_seconds) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content

    def _render_html_sync(self, template_source: str, context: dict[str, Any]) -> str:
        template = self.jinja_env.from_string(template_source)
        rendered = template.render(**context)
        return self._append_disclaimer(rendered)

    def _append_disclaimer(self, rendered_html: str) -> str:
        disclaimer = (
            '<p class="aksara-disclaimer">Draft created by Aksara Legal AI — Not legal advice.</p>'
        )
        lower_html = rendered_html.lower()
        closing_body = lower_html.rfind("</body>")
        if closing_body != -1:
            return rendered_html[:closing_body] + disclaimer + rendered_html[closing_body:]
        return rendered_html + disclaimer

    def _derive_base_url(self, template_url: str) -> str | None:
        parsed = urlparse(template_url)
        if not parsed.scheme or not parsed.netloc:
            return None
        return urljoin(template_url, ".")

    async def maybe_render_pdf(self, document: RenderedDocument) -> bytes:
        if not self.settings.enable_pdf_export:
            raise PdfExportError("PDF export disabled")
        if HTML is None:
            raise PdfExportError("WeasyPrint is not available in this environment")
        try:
            return await asyncio.to_thread(self._render_pdf_sync, document)
        except Exception as exc:  # pragma: no cover - safety net
            raise PdfExportError("HTML to PDF conversion failed") from exc

    def _render_pdf_sync(self, document: RenderedDocument) -> bytes:
        if HTML is None:  # pragma: no cover - defensive double-check
            raise PdfExportError("WeasyPrint is not available")
        html = HTML(string=document.html, base_url=document.base_url)
        return cast(bytes, html.write_pdf())

    async def persist_outputs(
        self, base_name: str, document: RenderedDocument, pdf_bytes: bytes | None
    ) -> dict[str, Any]:
        html_bytes = document.html.encode("utf-8")
        html_url = await self.storage.upload_bytes(
            f"{base_name}.html",
            html_bytes,
            "text/html; charset=utf-8",
        )
        result = {"doc_url": self.storage.sign_url(html_url)}
        if pdf_bytes:
            pdf_url = await self.storage.upload_bytes(
                f"{base_name}.pdf",
                pdf_bytes,
                "application/pdf",
            )
            result["pdf_url"] = self.storage.sign_url(pdf_url)
        return result
