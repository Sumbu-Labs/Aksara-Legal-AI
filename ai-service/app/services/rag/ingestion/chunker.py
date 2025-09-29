from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Chunk:
    text: str
    section: str
    order: int


def chunk_text(text: str, section: str, chunk_size: int = 700, overlap: int = 120) -> list[Chunk]:
    words = text.split()
    chunks: list[Chunk] = []
    start = 0
    order = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        chunk_text_value = " ".join(chunk_words)
        if chunk_text_value:
            chunks.append(Chunk(text=chunk_text_value, section=section, order=order))
            order += 1
        if end == len(words):
            break
        start = max(end - overlap, 0)
    return chunks
