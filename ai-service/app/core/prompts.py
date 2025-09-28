from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from app.core.logging import get_logger

logger = get_logger(__name__)


PROMPTS_PATH = Path(__file__).resolve().parent.parent.parent / "PROMPTS.md"


@lru_cache(maxsize=1)
def load_prompts() -> dict[str, str]:
    if not PROMPTS_PATH.exists():
        logger.warning("prompts_file_missing", path=str(PROMPTS_PATH))
        return {}
    content = PROMPTS_PATH.read_text(encoding="utf-8")
    sections: dict[str, str] = {}
    current_key: str | None = None
    buffer: list[str] = []
    for line in content.splitlines():
        if line.startswith("## "):
            if current_key and buffer:
                sections[current_key] = "\n".join(buffer).strip()
                buffer.clear()
            current_key = line.removeprefix("## ").strip().lower()
        else:
            buffer.append(line)
    if current_key and buffer:
        sections[current_key] = "\n".join(buffer).strip()
    return sections


def get_prompt(key: str) -> str:
    prompt = load_prompts().get(key.lower(), "")
    if not prompt:
        logger.warning("prompt_not_found", key=key)
    return prompt
