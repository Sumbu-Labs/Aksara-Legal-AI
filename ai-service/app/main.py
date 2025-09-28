from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import FastAPI, Request, Response
from fastapi.responses import ORJSONResponse
from structlog.contextvars import bind_contextvars, clear_contextvars

try:
    from scalar_fastapi import Theme, get_scalar_api_reference
except ImportError:
    get_scalar_api_reference = None
    Theme = None  # type: ignore[assignment]

from app.api.router import router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.utils.auth import decode_jwt
from app.utils.ids import generate_request_id
from app.utils.rate_limiter import rate_limiter

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(
    title="Aksara Legal AI Service",
    version="0.1.0",
    default_response_class=ORJSONResponse,
    docs_url=None,
    redoc_url=None,
)
app.include_router(router)

if get_scalar_api_reference is not None:
    scalar_kwargs: dict[str, Any] = {
        "openapi_url": app.openapi_url or "/openapi.json",
        "title": "Aksara Legal API Reference",
    }
    if Theme is not None:
        scalar_kwargs["theme"] = Theme.DEEP_SPACE
    app.mount("/docs", get_scalar_api_reference(**scalar_kwargs), name="scalar-docs")
else:
    logger.info("scalar_docs_disabled")



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


@app.on_event("shutdown")
async def shutdown_event() -> None:
    logger.info("app_shutdown")
    await asyncio.sleep(0)
