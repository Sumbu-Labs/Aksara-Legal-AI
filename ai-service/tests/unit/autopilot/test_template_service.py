from typing import Any, cast

import pytest
from sqlalchemy.exc import ProgrammingError

from app.services.autopilot.templates.service import TemplateService


class StubSession:
    def __init__(self, *, error: Exception | None = None, value: Any = None) -> None:
        self._error = error
        self._value = value

    async def execute(self, stmt: Any) -> Any:  # pragma: no cover - signature compatibility
        if self._error is not None:
            raise self._error
        return StubResult(self._value)


class StubResult:
    def __init__(self, value: Any) -> None:
        self._value = value

    def scalar_one_or_none(self) -> Any:
        return self._value


class DummyUndefinedTable(Exception):
    pass


def create_service(session: StubSession) -> TemplateService:
    return TemplateService(cast(Any, session))


@pytest.mark.asyncio
async def test_get_schema_returns_fallback_when_table_missing():
    error = ProgrammingError(
        statement="SELECT",
        params=None,
        orig=DummyUndefinedTable('relation "templates" does not exist'),
    )
    service = create_service(StubSession(error=error))

    schema = await service.get_schema("PIRT", "DIY")
    assert schema is not None
    assert schema["metadata"]["provider"] == "static-fallback"
    assert isinstance(schema["documents"]["fields"], list)
    assert len(schema["documents"]["fields"]) > 0


@pytest.mark.asyncio
async def test_get_schema_returns_fallback_when_template_missing():
    service = create_service(StubSession(value=None))

    schema = await service.get_schema("HALAL", "DIY")
    assert schema is not None
    assert schema["metadata"]["permit_type"] == "HALAL"


@pytest.mark.asyncio
async def test_get_schema_returns_none_for_unsupported_permit():
    service = create_service(StubSession(value=None))

    schema = await service.get_schema("UNKNOWN", "DIY")
    assert schema is None
