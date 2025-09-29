from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse, urlunparse

from minio import Minio
from minio.error import MinioException
from slugify import slugify

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class StorageClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        endpoint_config = self.settings.minio_endpoint
        parsed = urlparse(endpoint_config)
        if parsed.scheme:
            endpoint = parsed.netloc or parsed.path
            secure = parsed.scheme == 'https'
        else:
            endpoint = endpoint_config
            secure = self.settings.minio_use_ssl
        if not endpoint:
            raise ValueError("MINIO_ENDPOINT must define a host")

        self.client = Minio(
            endpoint,
            access_key=self.settings.minio_access_key.get_secret_value(),
            secret_key=self.settings.minio_secret_key.get_secret_value(),
            secure=secure,
            region=self.settings.minio_region,
        )
        self.bucket = self.settings.minio_bucket_documents
        self.public_endpoint = (
            str(self.settings.minio_public_endpoint)
            if self.settings.minio_public_endpoint
            else None
        )

        self._ensure_bucket()

    async def upload_bytes(self, name: str, data: bytes, content_type: str) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        name_path = Path(name)
        base_slug = slugify(name_path.stem, lowercase=False) or "document"
        extension = name_path.suffix
        safe_name = f"{timestamp}-{base_slug}{extension}"
        try:
            await asyncio.to_thread(
                self.client.put_object,
                self.bucket,
                safe_name,
                BytesIO(data),
                len(data),
                content_type=content_type,
            )
        except MinioException as exc:
            logger.exception(
                "storage_upload_failed", key=safe_name, bucket=self.bucket
            )
            raise RuntimeError("Failed to upload object to storage") from exc

        logger.info(
            "storage_upload",
            key=safe_name,
            bucket=self.bucket,
            content_type=content_type,
            size_bytes=len(data),
        )
        return safe_name

    def sign_url(self, key: str, ttl_seconds: int | None = None) -> str:
        ttl = ttl_seconds or self.settings.storage_signed_url_ttl_seconds
        try:
            presigned = self.client.presigned_get_object(
                self.bucket,
                key,
                expires=timedelta(seconds=ttl),
            )
        except MinioException as exc:
            logger.exception("storage_presign_failed", key=key, bucket=self.bucket)
            raise RuntimeError("Failed to generate storage URL") from exc

        if not self.public_endpoint:
            return presigned

        parsed_signed = urlparse(presigned)
        public = urlparse(self.public_endpoint)
        replaced = parsed_signed._replace(
            scheme=public.scheme or parsed_signed.scheme,
            netloc=public.netloc or parsed_signed.netloc,
        )
        return urlunparse(replaced)

    def _ensure_bucket(self) -> None:
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except MinioException as exc:
            logger.exception("storage_bucket_error", bucket=self.bucket)
            raise RuntimeError("Failed to ensure storage bucket") from exc


@lru_cache(maxsize=1)
def get_storage_client() -> StorageClient:
    return StorageClient()
