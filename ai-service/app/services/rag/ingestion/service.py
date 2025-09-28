from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models import Chunk as ChunkModel
from app.models import Document, DocumentType
from app.services.llm.gemini import get_gemini_client
from app.services.rag.ingestion.chunker import Chunk, chunk_text
from app.services.rag.ingestion.html import extract_sections, fetch_html, normalize_html
from app.services.rag.ingestion.pdf import chunk_pages, fetch_pdf, pdf_to_markdown

logger = get_logger(__name__)


class IngestionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.settings = get_settings()
        self.gemini = get_gemini_client()

    async def upsert(self, payload: dict[str, Any]) -> dict[str, Any]:
        url = payload["url"]
        permit_type = payload.get("permit_type")
        region = payload.get("region")
        source_title = payload.get("title", "")
        version_date = payload.get("version_date")
        selectors = payload.get("selectors")

        logger.info("ingestion_started", url=url, permit_type=permit_type, region=region)

        if url.lower().endswith(".pdf"):
            raw = await fetch_pdf(url, timeout=self.settings.request_timeout_seconds)
            text = pdf_to_markdown(raw)
            sections = list(chunk_pages(text))
            document_type = DocumentType.PDF
        else:
            html = await fetch_html(url, timeout=self.settings.request_timeout_seconds)
            text = normalize_html(html)
            sections = list(extract_sections(html))
            document_type = DocumentType.HTML

        if not sections:
            sections = [("Umum", text)]

        sha = hashlib.sha256(text.encode("utf-8")).hexdigest()

        stmt = select(Document).where(Document.url == url)
        result = await self.session.execute(stmt)
        document = result.scalar_one_or_none()

        if document is None:
            document = Document(
                url=url,
                type=document_type,
                uploaded_by=payload.get("uploaded_by"),
                sha256=sha,
            )
            self.session.add(document)
            await self.session.flush()
        else:
            document.sha256 = sha
            document.type = document_type
            await self.session.flush()
            await self.session.execute(delete(ChunkModel).where(ChunkModel.document_id == document.id))

        all_chunks: list[Chunk] = []
        for section_title, section_text in sections:
            chunks = chunk_text(section_text, section_title)
            all_chunks.extend(chunks)

        stored_chunks = await self._store_chunks(document.id, all_chunks, {
            "source_url": url,
            "source_title": source_title,
            "permit_type": permit_type,
            "region": region,
            "language": "id",
            "version_date": version_date,
            "selectors": selectors,
            "ingested_at": datetime.utcnow().isoformat(),
        })

        await self.session.commit()

        logger.info("ingestion_completed", url=url, chunks=len(stored_chunks))
        return {"url": url, "chunks": len(stored_chunks)}

    async def _store_chunks(
        self,
        document_id: int,
        chunks: list[Chunk],
        metadata_base: dict[str, Any],
    ) -> list[int]:
        stored_ids: list[int] = []
        for chunk in chunks:
            embedding = await self.gemini.embed_text(chunk.text)
            chunk_model = ChunkModel(
                document_id=document_id,
                text=chunk.text,
                metadata={**metadata_base, "section": chunk.section, "order": chunk.order},
                embedding=embedding,
            )
            self.session.add(chunk_model)
            await self.session.flush()
            stored_ids.append(chunk_model.id)
        return stored_ids
