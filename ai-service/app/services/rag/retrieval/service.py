from __future__ import annotations

import json
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
        vector_results: list[RetrievedChunk] = []
        if self._supports_vector_search():
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
        stmt = self._apply_metadata_filters(stmt, filters)
        stmt = stmt.order_by(Chunk.embedding.cosine_distance(embedding))
        return stmt

    def _build_text_stmt(
        self, query: str, filters: dict[str, str | None]
    ) -> Select[Any]:
        like_term = f"%{query.lower()}%"
        stmt = select(Chunk, Document).join(Document, Chunk.document_id == Document.id)
        stmt = stmt.where(func.lower(Chunk.text).like(like_term))
        stmt = self._apply_metadata_filters(stmt, filters)
        stmt = stmt.order_by(func.length(Chunk.text))
        return stmt

    def _apply_metadata_filters(
        self, stmt: Select[Any], filters: dict[str, str | None]
    ) -> Select[Any]:
        for key in ("permit_type", "region"):
            value = filters.get(key)
            if not value:
                continue
            stmt = stmt.where(self._metadata_field(key) == value)
        return stmt

    def _metadata_field(self, key: str) -> Any:
        if self._using_sqlite():
            return func.json_extract(Chunk.chunk_metadata, f'$.{key}')
        return Chunk.chunk_metadata[key].astext

    def _supports_vector_search(self) -> bool:
        return not self._using_sqlite()

    def _using_sqlite(self) -> bool:
        bind = getattr(self.session, "bind", None)
        if bind is None:
            return False
        sync_engine = getattr(bind, "sync_engine", None)
        if sync_engine is not None:
            dialect_name = sync_engine.dialect.name
        else:
            dialect_name = bind.dialect.name
        return dialect_name.lower() == "sqlite"

    def _merge_results(
        self, vector_results: list[RetrievedChunk], text_results: list[RetrievedChunk]
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

    def _row_to_chunk(self, row: Any, base: float) -> RetrievedChunk:
        chunk: Chunk = row[0]
        document: Document = row[1]
        metadata_raw = chunk.chunk_metadata
        if isinstance(metadata_raw, str):
            try:
                metadata = json.loads(metadata_raw)
            except json.JSONDecodeError:  # pragma: no cover - defensive
                metadata = {}
        else:
            metadata = dict(metadata_raw)
        metadata.setdefault("source_title", metadata.get("source_title") or document.url)
        metadata.setdefault("version_date", metadata.get("version_date"))
        return RetrievedChunk(text=chunk.text, metadata=metadata, score=base)

