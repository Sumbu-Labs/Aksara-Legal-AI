from __future__ import annotations

from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Optional

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class StorageClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.storage_bucket_url
        self.signing_key = self.settings.storage_signing_key.get_secret_value()
        self.output_dir = Path("generated")
        self.output_dir.mkdir(exist_ok=True)

    async def upload_bytes(self, name: str, data: bytes, content_type: str) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        safe_name = f"{timestamp}-{name}"
        target = self.output_dir / safe_name
        target.write_bytes(data)
        logger.info("storage_upload", path=str(target), content_type=content_type)
        return f"{self.base_url.rstrip('/')}/{safe_name}"

    def sign_url(self, path: str, ttl_seconds: Optional[int] = None) -> str:
        ttl = ttl_seconds or self.settings.storage_signed_url_ttl_seconds
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)
        signature = hash((path, self.signing_key, ttl)) & 0xFFFFFFFF
        return f"{path}?expires={int(expires_at.timestamp())}&sig={signature}"


@lru_cache(maxsize=1)
def get_storage_client() -> StorageClient:
    return StorageClient()
