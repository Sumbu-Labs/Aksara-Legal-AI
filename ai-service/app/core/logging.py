import logging
import sys
from typing import cast

import structlog


def configure_logging(log_level: str = "INFO") -> None:
    logging.basicConfig(
        level=log_level,
        format="%(message)s",
        stream=sys.stdout,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    return cast(structlog.stdlib.BoundLogger, structlog.get_logger(name))


def bind_request(
    request_id: str, span_id: str | None = None, user_id: str | None = None
) -> dict[str, str]:
    context: dict[str, str] = {"request_id": request_id}
    if span_id:
        context["span_id"] = span_id
    if user_id:
        context["user_id"] = user_id
    return context
