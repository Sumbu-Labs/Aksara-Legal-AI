from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path
from typing import Any

import httpx
from docxtpl import DocxTemplate

from app.core.config import get_settings
from app.core.errors import PdfExportError
from app.core.logging import get_logger
from app.services.storage.client import get_storage_client

logger = get_logger(__name__)


class DocumentRenderer:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.storage = get_storage_client()

    async def render_docx(self, template_url: str, context: dict[str, Any]) -> bytes:
        template_bytes = await self._download(template_url)
        return await asyncio.to_thread(self._render_docx_sync, template_bytes, context)

    async def _download(self, url: str) -> bytes:
        async with httpx.AsyncClient(timeout=self.settings.request_timeout_seconds) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content

    def _render_docx_sync(self, template_bytes: bytes, context: dict[str, Any]) -> bytes:
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_template:
            tmp_template.write(template_bytes)
            tmp_template_path = Path(tmp_template.name)
        doc = DocxTemplate(str(tmp_template_path))
        doc.render(context)
        doc.add_paragraph("\nDraft created by Aksara Legal AI — Not legal advice.")
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_output:
            doc.save(tmp_output.name)
            output_path = Path(tmp_output.name)
            data = output_path.read_bytes()
        tmp_template_path.unlink(missing_ok=True)
        output_path.unlink(missing_ok=True)
        return data

    async def maybe_convert_pdf(self, docx_bytes: bytes) -> bytes:
        if not self.settings.enable_pdf_export:
            raise PdfExportError("PDF export disabled")
        libreoffice = self.settings.libreoffice_binary or "soffice"
        with tempfile.TemporaryDirectory() as tmpdir:
            docx_path = Path(tmpdir) / "input.docx"
            docx_path.write_bytes(docx_bytes)
            proc = await asyncio.create_subprocess_exec(
                libreoffice,
                "--headless",
                "--convert-to",
                "pdf",
                str(docx_path),
                "--outdir",
                tmpdir,
            )
            await proc.wait()
            pdf_path = Path(tmpdir) / "input.pdf"
            if not pdf_path.exists():
                raise PdfExportError("LibreOffice conversion failed")
            return pdf_path.read_bytes()

    async def persist_outputs(
        self, base_name: str, docx_bytes: bytes, pdf_bytes: bytes | None
    ) -> dict[str, Any]:
        doc_url = await self.storage.upload_bytes(
            f"{base_name}.docx",
            docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
        signed_doc_url = self.storage.sign_url(doc_url)
        result = {"doc_url": signed_doc_url}
        if pdf_bytes:
            pdf_url = await self.storage.upload_bytes(
                f"{base_name}.pdf",
                pdf_bytes,
                "application/pdf",
            )
            result["pdf_url"] = self.storage.sign_url(pdf_url)
        return result
