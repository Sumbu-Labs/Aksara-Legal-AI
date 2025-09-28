from __future__ import annotations

import asyncio
from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response
from fastapi.responses import ORJSONResponse
from structlog.contextvars import bind_contextvars, clear_contextvars

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
)
app.include_router(router)


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
        except Exception:  # noqa: BLE001
            user_key = request.client.host if request.client else "unknown"
    response: Response | None = None
    try:
        rate_limiter.check(str(user_key))
        bind_contextvars(request_id=request_id, user_id=str(user_key))
        response = await call_next(request)
    finally:
        clear_contextvars()
    if response is None:
        response = Response(status_code=500)
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
