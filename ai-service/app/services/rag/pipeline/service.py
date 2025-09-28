from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.prompts import get_prompt
from app.core.logging import get_logger
from app.services.llm.gemini import get_gemini_client
from app.services.rag.retrieval.service import RetrievalService, RetrievedChunk

logger = get_logger(__name__)


class RagPipeline:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.settings = get_settings()
        self.retrieval = RetrievalService(session)
        self.gemini = get_gemini_client()
        self.prompt = get_prompt("q&a system prompt")

    async def answer(self, payload: dict[str, Any]) -> dict[str, Any]:
        question: str = payload["question"].strip()
        permit_type = payload.get("permit_type")
        region = payload.get("region")

        if not question:
            return self._cannot_verify()

        filters = {"permit_type": permit_type, "region": region}
        chunks = await self.retrieval.search(question, filters)
        if not chunks:
            logger.info("rag_no_chunks", question=question)
            return self._cannot_verify()

        context_block = self._build_context_block(chunks)
        contents = self._build_contents(question, context_block)
        response = await self.gemini.generate_answer(self.prompt, contents)

        answer_text = self._extract_text(response)
        if not answer_text:
            return self._cannot_verify()

        citations = self._build_citations(chunks)
        if not citations:
            return self._cannot_verify()

        retrieval_meta = self._build_retrieval_meta(chunks)
        model_meta = {
            "model": self.settings.gemini_model_qa,
            "prompt_tokens": response.get("usageMetadata", {}).get("promptTokenCount"),
            "response_tokens": response.get("usageMetadata", {}).get("candidatesTokenCount"),
        }

        return {
            "answer_md": answer_text,
            "citations": citations,
            "retrieval_meta": retrieval_meta,
            "model_meta": model_meta,
        }

    def _build_context_block(self, chunks: list[RetrievedChunk]) -> str:
        blocks: list[str] = []
        for idx, chunk in enumerate(chunks, start=1):
            meta = chunk.metadata
            source = meta.get("source_title") or meta.get("source_url")
            section = meta.get("section") or ""
            version = meta.get("version_date") or ""
            snippet = chunk.text
            block = (
                f"Sumber #{idx}\n"
                f"Judul: {source}\n"
                f"Bagian: {section}\n"
                f"Versi: {version}\n"
                f"Isi:\n{snippet}"
            )
            blocks.append(block)
        return "\n\n".join(blocks)

    def _build_contents(self, question: str, context_block: str) -> list[dict[str, Any]]:
        return [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            f"Pertanyaan: {question}\n"
                            "Jawab berdasarkan konteks yang diberikan."
                        )
                    }
                ],
            },
            {
                "role": "user",
                "parts": [{"text": context_block}],
            },
        ]

    @staticmethod
    def _extract_text(response: dict[str, Any]) -> str:
        try:
            return response["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError, TypeError, AttributeError):
            logger.warning("gemini_answer_parse_failed", response=response)
            return ""

    def _build_citations(self, chunks: list[RetrievedChunk]) -> list[dict[str, Any]]:
        citations: list[dict[str, Any]] = []
        seen: set[str] = set()
        for chunk in chunks:
            meta = chunk.metadata
            url = meta.get("source_url")
            if not url or url in seen:
                continue
            seen.add(url)
            citations.append(
                {
                    "url": url,
                    "title": meta.get("source_title") or "Sumber",
                    "section": meta.get("section"),
                    "snippet": chunk.text[:400],
                }
            )
        return citations

    def _build_retrieval_meta(self, chunks: list[RetrievedChunk]) -> dict[str, Any]:
        versions = [c.metadata.get("version_date") for c in chunks if c.metadata.get("version_date")]
        latest = max(versions) if versions else None
        return {
            "chunks_considered": len(chunks),
            "latest_version_date": latest,
        }

    @staticmethod
    def _cannot_verify() -> dict[str, Any]:
        return {
            "answer_md": "Saya tidak dapat memverifikasi ini.",
            "citations": [],
            "retrieval_meta": {},
            "model_meta": {},
        }
