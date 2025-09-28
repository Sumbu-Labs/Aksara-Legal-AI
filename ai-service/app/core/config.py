from functools import lru_cache
from typing import Literal, Optional

from pydantic import AnyHttpUrl, Field, HttpUrl, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    """Application configuration loaded from environment."""

    model_config = SettingsConfigDict(env_file=('.env',), env_file_encoding='utf-8', extra='ignore')

    app_env: Literal['local', 'dev', 'staging', 'prod'] = Field(default='local', alias='APP_ENV')
    port: int = Field(default=8000, alias='PORT')
    log_level: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR'] = Field(default='INFO', alias='LOG_LEVEL')

    database_url: SecretStr = Field(alias='DATABASE_URL')
    vector_dim: int = Field(default=1536, alias='VECTOR_DIM')

    gemini_api_key: SecretStr = Field(alias='GEMINI_API_KEY')
    gemini_model_qa: str = Field(default='gemini-2.5-pro', alias='GEMINI_MODEL_QA')
    gemini_model_embed: str = Field(default='text-embedding-004', alias='GEMINI_MODEL_EMBED')

    storage_bucket_url: AnyHttpUrl = Field(alias='STORAGE_BUCKET_URL')
    storage_signing_key: SecretStr = Field(alias='STORAGE_SIGNING_KEY')

    enable_pdf_export: bool = Field(default=False, alias='ENABLE_PDF_EXPORT')

    retrieval_topk: int = Field(default=24, alias='RETRIEVAL_TOPK')
    rerank_topk: int = Field(default=8, alias='RERANK_TOPK')

    jwt_issuer: str = Field(alias='JWT_ISSUER')
    jwt_audience: str = Field(alias='JWT_AUDIENCE')
    jwt_public_key: str = Field(alias='JWT_PUBLIC_KEY')

    request_timeout_seconds: float = Field(default=15.0)
    llm_timeout_seconds: float = Field(default=20.0)
    llm_max_retries: int = Field(default=3)

    storage_signed_url_ttl_seconds: int = Field(default=3600)

    libreoffice_binary: Optional[str] = Field(default=None, alias='LIBREOFFICE_BINARY')


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    return AppSettings()  # type: ignore[arg-type]
