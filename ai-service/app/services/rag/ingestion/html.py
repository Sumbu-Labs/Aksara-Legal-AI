from __future__ import annotations

from collections.abc import Iterable

import httpx
from bs4 import BeautifulSoup
from bs4.element import Tag
from readability import Document as ReadabilityDocument

from app.core.logging import get_logger

logger = get_logger(__name__)


async def fetch_html(url: str, timeout: float) -> str:
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text


def normalize_html(html: str) -> str:
    readable = ReadabilityDocument(html)
    content_html = readable.summary(html_partial=True)
    soup = BeautifulSoup(content_html, "lxml")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text_parts: list[str] = []
    for element in soup.stripped_strings:
        text_parts.append(element)
    return "\n".join(text_parts)


def extract_sections(html: str) -> Iterable[tuple[str, str]]:
    soup = BeautifulSoup(html, "lxml")
    current_heading = ""
    buffer: list[str] = []
    for element in soup.descendants:
        if isinstance(element, Tag) and element.name and element.name.startswith("h") and element.name[1:].isdigit():
            if buffer and current_heading:
                yield current_heading, "\n".join(buffer)
                buffer.clear()
            current_heading = element.get_text(strip=True)
        elif isinstance(element, Tag) and element.name == "p":
            buffer.append(element.get_text(strip=True))
    if buffer and current_heading:
        yield current_heading, "\n".join(buffer)
