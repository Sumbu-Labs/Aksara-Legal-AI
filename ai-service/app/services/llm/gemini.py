from __future__ import annotations

import json
from collections.abc import Iterable
from functools import lru_cache
from typing import Any, cast

import httpx
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class GeminiClient:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.gemini_api_key.get_secret_value()
        self._qa_model = settings.gemini_model_qa
        self._embed_model = settings.gemini_model_embed
        self._timeout = settings.llm_timeout_seconds
        self._max_retries = settings.llm_max_retries
        self._base_url = "https://generativelanguage.googleapis.com/v1beta"
        self._default_headers = {
            "x-goog-api-key": self._api_key,
            "Content-Type": "application/json",
        }

    async def _post(self, endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self._base_url}/{endpoint}"
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(self._max_retries),
                wait=wait_exponential(min=1, max=8),
                retry=retry_if_exception_type(httpx.HTTPError),
                reraise=True,
            ):
                with attempt:
                    response = await client.post(url, json=payload, headers=self._default_headers)
                    response.raise_for_status()
                    data = cast(dict[str, Any], response.json())
                    logger.debug("gemini_api_response", payload=payload, data=data)
                    return data
        raise RuntimeError("Gemini API call failed")

    async def embed_text(self, text: str) -> list[float]:
        payload = {
            "content": {
                "parts": [{"text": text}],
            }
        }
        endpoint = f"models/{self._embed_model}:embedContent"
        data = await self._post(endpoint, payload)
        embedding: Any | None = data.get("embedding")
        if embedding is None and "embeddings" in data:
            embeddings = data.get("embeddings")
            if isinstance(embeddings, list) and embeddings:
                embedding = embeddings[0]
        values = None
        if isinstance(embedding, dict):
            values = embedding.get("values") or embedding.get("value")
        if not isinstance(values, list):
            raise ValueError("Empty embedding response from Gemini")
        try:
            return [float(value) for value in values]
        except (TypeError, ValueError) as exc:
            raise ValueError("Invalid embedding response from Gemini") from exc

    async def generate_answer(self, prompt: str, contents: Iterable[dict[str, Any]]) -> dict[str, Any]:
        payload = {
            "system_instruction": {"parts": [{"text": prompt}]},
            "contents": list(contents),
            "safetySettings": [
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_LOW_AND_ABOVE"}
            ],
        }
        endpoint = f"models/{self._qa_model}:generateContent"
        return await self._post(endpoint, payload)

    async def call_resolver(self, prompt: str, context: dict[str, Any]) -> dict[str, Any]:
        payload = {
            "system_instruction": {"parts": [{"text": prompt}]},
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": json.dumps(context, ensure_ascii=False),
                        }
                    ],
                }
            ],
        }
        endpoint = f"models/{self._qa_model}:generateContent"
        return await self._post(endpoint, payload)

    async def rerank(self, query: str, candidates: list[str]) -> list[int]:
        if not candidates:
            return []
        payload = {
            "system_instruction": {
                "parts": [
                    {"text": "You are a legal document reranker. Rank passages by relevance."}
                ]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": json.dumps({"query": query, "candidates": candidates}, ensure_ascii=False)}
                    ],
                }
            ],
        }
        endpoint = f"models/{self._qa_model}:generateContent"
        data = await self._post(endpoint, payload)
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            ranking = json.loads(text)
            order = ranking.get("order")
            if isinstance(order, list):
                return [int(idx) for idx in order]
        except (KeyError, json.JSONDecodeError, ValueError, TypeError):
            logger.warning("gemini_rerank_parse_failed", data=data)
        return list(range(len(candidates)))


@lru_cache(maxsize=1)
def get_gemini_client() -> GeminiClient:
    return GeminiClient()
