from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models import Chunk, Document
from app.services.llm.gemini import get_gemini_client

logger = get_logger(__name__)


@dataclass(slots=True)
class RetrievedChunk:
    text: str
    metadata: dict[str, Any]
    score: float


class RetrievalService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.settings = get_settings()
        self.gemini = get_gemini_client()

    async def search(
        self, query: str, filters: dict[str, str | None]
    ) -> list[RetrievedChunk]:
        embedding = await self.gemini.embed_text(query)
        vector_stmt = self._build_vector_stmt(embedding, filters).limit(
            self.settings.retrieval_topk
        )

        vector_rows = (await self.session.execute(vector_stmt)).all()
        vector_results = [self._row_to_chunk(row, base=0.5) for row in vector_rows]

        text_stmt = self._build_text_stmt(query, filters).limit(
            self.settings.retrieval_topk
        )
        text_rows = (await self.session.execute(text_stmt)).all()
        text_results = [self._row_to_chunk(row, base=0.3) for row in text_rows]

        combined = self._merge_results(vector_results, text_results)

        texts = [chunk.text for chunk in combined]
        rerank_indices = await self.gemini.rerank(query, texts)
        reranked = [combined[i] for i in rerank_indices if i < len(combined)]
        if not reranked:
            reranked = combined
        return reranked[: self.settings.rerank_topk]

    def _build_vector_stmt(
        self, embedding: list[float], filters: dict[str, str | None]
    ) -> Select[Any]:
        stmt = select(Chunk, Document).join(Document, Chunk.document_id == Document.id)
        if filters.get("permit_type"):
            stmt = stmt.where(Chunk.chunk_metadata["permit_type"].astext == filters["permit_type"])
        if filters.get("region"):
            stmt = stmt.where(Chunk.chunk_metadata["region"].astext == filters["region"])
        stmt = stmt.order_by(Chunk.embedding.cosine_distance(embedding))
        return stmt

    def _build_text_stmt(
        self, query: str, filters: dict[str, str | None]
    ) -> Select[Any]:
        like_term = f"%{query.lower()}%"
        stmt = select(Chunk, Document).join(Document, Chunk.document_id == Document.id)
        stmt = stmt.where(func.lower(Chunk.text).like(like_term))
        if filters.get("permit_type"):
            stmt = stmt.where(Chunk.chunk_metadata["permit_type"].astext == filters["permit_type"])
        if filters.get("region"):
            stmt = stmt.where(Chunk.chunk_metadata["region"].astext == filters["region"])
        stmt = stmt.order_by(func.length(Chunk.text))
        return stmt

    @staticmethod
    def _merge_results(
        vector_results: list[RetrievedChunk], text_results: list[RetrievedChunk]
    ) -> list[RetrievedChunk]:
        merged: dict[str, RetrievedChunk] = {}
        for item in vector_results + text_results:
            key = "::".join(
                [
                    str(item.metadata.get('source_url')),
                    str(item.metadata.get('section')),
                    str(item.metadata.get('order')),
                ]
            )
            if key in merged:
                merged[key].score = max(merged[key].score, item.score)
            else:
                merged[key] = item
        return sorted(merged.values(), key=lambda x: x.score, reverse=True)

    @staticmethod
    def _row_to_chunk(row: Any, base: float) -> RetrievedChunk:
        chunk: Chunk = row[0]
        document: Document = row[1]
        metadata = dict(chunk.chunk_metadata)
        metadata.setdefault("source_title", metadata.get("source_title") or document.url)
        metadata.setdefault("version_date", metadata.get("version_date"))
        return RetrievedChunk(text=chunk.text, metadata=metadata, score=base)

