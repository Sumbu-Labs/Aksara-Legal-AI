from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

MODEL_CONFIG: SettingsConfigDict = {
    "env_file": ('.env',),
    "env_file_encoding": 'utf-8',
    "extra": 'ignore',
}


class AppSettings(BaseSettings):
    """Application configuration loaded from environment."""

    # Use a module-level MODEL_CONFIG so assignment is safe across Pydantic versions
    model_config = MODEL_CONFIG

    app_env: Literal['local', 'dev', 'staging', 'prod'] = Field(default='local', alias='APP_ENV')
    port: int = Field(default=7700, alias='PORT')
    log_level: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR'] = Field(
        default='INFO',
        alias='LOG_LEVEL',
    )

    database_url: SecretStr = Field(
        default=SecretStr("sqlite+aiosqlite:///:memory:"),
        alias='DATABASE_URL',
    )
    vector_dim: int = Field(default=1536, alias='VECTOR_DIM')

    gemini_api_key: SecretStr = Field(
        default=SecretStr("dummy-gemini-key"),
        alias='GEMINI_API_KEY',
    )
    gemini_model_qa: str = Field(default='gemini-2.5-pro', alias='GEMINI_MODEL_QA')
    gemini_model_embed: str = Field(default='text-embedding-004', alias='GEMINI_MODEL_EMBED')

    minio_endpoint: str = Field(default='http://minio:7900', alias='MINIO_ENDPOINT')
    minio_use_ssl: bool = Field(default=False, alias='MINIO_USE_SSL')
    minio_access_key: SecretStr = Field(
        default=SecretStr('minioadmin'),
        alias='MINIO_ROOT_USER',
    )
    minio_secret_key: SecretStr = Field(
        default=SecretStr('minioadmin'),
        alias='MINIO_ROOT_PASSWORD',
    )
    minio_bucket_documents: str = Field(
        default='documents',
        alias='MINIO_BUCKET_DOCUMENTS',
    )
    minio_region: str | None = Field(default=None, alias='MINIO_REGION')
    minio_public_endpoint: AnyHttpUrl | None = Field(
        default=None,
        alias='MINIO_PUBLIC_ENDPOINT',
    )

    enable_pdf_export: bool = Field(default=False, alias='ENABLE_PDF_EXPORT')

    retrieval_topk: int = Field(default=24, alias='RETRIEVAL_TOPK')
    rerank_topk: int = Field(default=8, alias='RERANK_TOPK')

    jwt_issuer: str = Field(default='https://auth.local/', alias='JWT_ISSUER')
    jwt_audience: str = Field(default='aksara-legal-ai', alias='JWT_AUDIENCE')
    jwt_public_key: str = Field(default='dummy-public-key', alias='JWT_PUBLIC_KEY')

    request_timeout_seconds: float = Field(default=15.0)
    llm_timeout_seconds: float = Field(default=20.0)
    llm_max_retries: int = Field(default=3)

    storage_signed_url_ttl_seconds: int = Field(
        default=3600,
        alias='MINIO_PRESIGNED_TTL',
        validation_alias=AliasChoices('MINIO_PRESIGNED_TTL', 'STORAGE_SIGNED_URL_TTL_SECONDS'),
    )

    libreoffice_binary: str | None = Field(default=None, alias='LIBREOFFICE_BINARY')


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    return AppSettings()
