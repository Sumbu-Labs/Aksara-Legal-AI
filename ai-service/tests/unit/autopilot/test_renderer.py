from dataclasses import dataclass
from typing import Any, cast

import pytest

from app.services.autopilot.renderer.service import DocumentRenderer, RenderedDocument


@dataclass
class FakeSettings:
    enable_pdf_export: bool = True
    request_timeout_seconds: float = 10.0


class StubStorage:
    async def upload_bytes(self, name: str, data: bytes, content_type: str) -> str:  # pragma: no cover - stub
        return f"https://storage.local/{name}"

    def sign_url(self, url: str) -> str:  # pragma: no cover - stub
        return f"{url}?signed=1"


def create_renderer(monkeypatch: pytest.MonkeyPatch, *, enable_pdf_export: bool = True) -> DocumentRenderer:
    storage = StubStorage()
    monkeypatch.setattr(
        "app.services.autopilot.renderer.service.get_storage_client",
        lambda: storage,
    )
    settings = FakeSettings(enable_pdf_export=enable_pdf_export)
    renderer = DocumentRenderer(settings=cast(Any, settings))
    renderer.storage = cast(Any, storage)
    return renderer


@pytest.mark.asyncio
async def test_render_html_inserts_disclaimer(monkeypatch):
    renderer = create_renderer(monkeypatch)

    async def fake_download(url: str) -> bytes:
        assert url == "https://example.com/template.html"
        return b"<html><body><h1>{{ name }}</h1></body></html>"

    monkeypatch.setattr(renderer, "_download", fake_download)

    document = await renderer.render_html(
        "https://example.com/template.html",
        {"name": "Aksara"},
    )

    assert "Aksara" in document.html
    assert "Draft created by Aksara Legal AI" in document.html
    assert document.base_url == "https://example.com/"


@pytest.mark.asyncio
async def test_render_pdf_creates_output(monkeypatch):
    renderer = create_renderer(monkeypatch, enable_pdf_export=True)

    async def fake_download(url: str) -> bytes:
        return b"<html><body><p>Content</p></body></html>"

    monkeypatch.setattr(renderer, "_download", fake_download)

    document = await renderer.render_html("https://example.com/template.html", {})
    pdf_bytes = await renderer.maybe_render_pdf(document)

    assert isinstance(pdf_bytes, bytes)
    # WeasyPrint generates a PDF header starting with %PDF-
    assert pdf_bytes.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_persist_outputs_uses_storage(monkeypatch):
    renderer = create_renderer(monkeypatch)
    document = RenderedDocument(html="<html>Hi</html>", base_url=None)

    class DummyStorage:
        def __init__(self) -> None:
            self.html_payload: tuple[str, bytes, str] | None = None
            self.pdf_payload: tuple[str, bytes, str] | None = None

        async def upload_bytes(self, name: str, data: bytes, content_type: str) -> str:
            if name.endswith(".html"):
                self.html_payload = (name, data, content_type)
            else:
                self.pdf_payload = (name, data, content_type)
            return f"https://storage.local/{name}"

        def sign_url(self, url: str) -> str:
            return f"{url}?signed=1"

    storage = DummyStorage()
    renderer.storage = cast(Any, storage)

    outputs = await renderer.persist_outputs("permit-user", document, b"fake-pdf")

    assert storage.html_payload is not None
    assert storage.html_payload[0].endswith("permit-user.html")
    assert storage.html_payload[2] == "text/html; charset=utf-8"
    assert storage.pdf_payload is not None
    assert storage.pdf_payload[0].endswith("permit-user.pdf")
    assert outputs["doc_url"].endswith("permit-user.html?signed=1")
    assert outputs["pdf_url"].endswith("permit-user.pdf?signed=1")
