from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import Any, cast

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import ORJSONResponse
from structlog.contextvars import bind_contextvars, clear_contextvars

from app.api.router import router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.migrations import apply_migrations
from app.utils.auth import decode_jwt
from app.utils.ids import generate_request_id
from app.utils.rate_limiter import rate_limiter

try:
    from scalar_fastapi import get_scalar_api_reference as _scalar_reference_factory
except ImportError:
    _scalar_reference_factory = None  # type: ignore[assignment]

scalar_reference_factory: Callable[..., Any] | None = cast(
    Callable[..., Any] | None, _scalar_reference_factory
)

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(
    title="Aksara Legal AI Service",
    description=(
        "Grounded legal Q&A, Autopilot document generation, and ingestion APIs for UMKM permit workflows."
        "\n\n"
        "Use the Scalar reference at `/docs` to explore endpoints, authenticate with a JWT Bearer token,"
        " and review request/response samples and error formats."
    ),
    version="0.1.0",
    terms_of_service="https://aksara.id/terms",
    contact={
        "name": "Aksara Platform Team",
        "email": "platform@aksara.id",
        "url": "https://aksara.id",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0",
    },
    default_response_class=ORJSONResponse,
    docs_url=None,
    redoc_url=None,
    servers=[
        {"url": "http://localhost:7700", "description": "Local development"},
        {"url": "https://api-dev.aksara.id", "description": "Staging"},
        {"url": "https://api.aksara.id", "description": "Production"},
    ],
    openapi_tags=[
        {"name": "qa", "description": "Ask grounded legal questions with citations."},
        {
            "name": "autopilot",
            "description": "Generate permit application drafts and audit trails using structured inputs.",
        },
        {"name": "templates", "description": "Fetch Autopilot template schemas and metadata."},
        {
            "name": "ingest",
            "description": "Ingest or refresh regulatory sources for the retrieval pipeline.",
        },
        {"name": "health", "description": "Check service, database, RAG index, and LLM readiness."},
    ],
)

cors_allowed_origins = [
    origin.strip()
    for origin in settings.cors_allowed_origins.split(',')
    if origin.strip()
]

if not cors_allowed_origins:
    cors_allowed_origins = ['http://localhost:7500']

allow_all_origins = any(origin in {'*', 'http://*', 'https://*'} for origin in cors_allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'] if allow_all_origins else cors_allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
    expose_headers=['X-Request-ID'],
)
app.include_router(router)

if scalar_reference_factory is not None:
    scalar_app = scalar_reference_factory(
        openapi_url=app.openapi_url or "/openapi.json",
        title="Aksara Legal API Reference",
    )
    app.mount("/docs", scalar_app, name="scalar-docs")
else:
    logger.info("scalar_docs_disabled")


def custom_openapi() -> dict[str, Any]:
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags,
        servers=app.servers,
    )

    components = openapi_schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes["JWTBearer"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Paste a JWT issued by the Aksara identity service.",
    }

    for path_item in openapi_schema.get("paths", {}).values():
        for operation in path_item.values():
            tags = set(operation.get("tags", []))
            if "health" in tags:
                continue
            operation.setdefault("security", [])
            if {"JWTBearer": []} not in operation["security"]:
                operation["security"].append({"JWTBearer": []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi  # type: ignore[assignment]



@app.middleware("http")
async def request_context_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    request_id = request.headers.get("X-Request-ID", generate_request_id())
    user_key = request.client.host if request.client else "unknown"
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_jwt(token)
            user_key = payload.get("sub", user_key)
        except Exception:
            user_key = request.client.host if request.client else "unknown"
    rate_limiter.check(str(user_key))
    bind_contextvars(request_id=request_id, user_id=str(user_key))
    try:
        response = await call_next(request)
    finally:
        clear_contextvars()
    response.headers["X-Request-ID"] = request_id
    return response


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("app_startup", env=settings.app_env)
    try:
        await apply_migrations()
    except Exception:
        logger.exception("migrations_failed")
        raise


@app.on_event("shutdown")
async def shutdown_event() -> None:
    logger.info("app_shutdown")
    await asyncio.sleep(0)
