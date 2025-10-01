from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

import pytest

from app.core.config import get_settings
from app.services.llm.gemini import GeminiClient

def _settings_with_env(monkeypatch: pytest.MonkeyPatch, **env: str) -> Iterator[None]:
    @contextmanager
    def _manager() -> Iterator[None]:
        original = {key: os.environ.get(key) for key in env}
        try:
            for key, value in env.items():
                monkeypatch.setenv(key, value)
            get_settings.cache_clear()
            yield
        finally:
            for key, value in original.items():
                if value is None:
                    monkeypatch.delenv(key, raising=False)
                else:
                    monkeypatch.setenv(key, value)
            get_settings.cache_clear()

    return _manager()


def test_model_normalization_accepts_prefixed_names(monkeypatch: pytest.MonkeyPatch) -> None:
    with _settings_with_env(
        monkeypatch,
        GEMINI_MODEL_EMBED="models/text-embedding-004",
        GEMINI_MODEL_QA="models/gemini-2.5-pro",
    ):
        client = GeminiClient()
        assert client._embed_model == "models/text-embedding-004"
        assert client._embed_model_path == "models/text-embedding-004"
        assert client._qa_model == "models/gemini-2.5-pro"
        assert client._qa_model_path == "models/gemini-2.5-pro"


def test_model_normalization_adds_missing_prefix(monkeypatch: pytest.MonkeyPatch) -> None:
    with _settings_with_env(
        monkeypatch,
        GEMINI_MODEL_EMBED="text-embedding-004",
        GEMINI_MODEL_QA="gemini-2.5-pro",
    ):
        client = GeminiClient()
        assert client._embed_model == "text-embedding-004"
        assert client._embed_model_path == "models/text-embedding-004"
        assert client._qa_model == "gemini-2.5-pro"
        assert client._qa_model_path == "models/gemini-2.5-pro"
