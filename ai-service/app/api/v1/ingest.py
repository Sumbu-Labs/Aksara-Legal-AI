from fastapi import APIRouter, Depends

from app.api.deps import get_db_session
from app.schemas.common import ErrorResponse
from app.schemas.ingest import IngestUpsertRequest, IngestUpsertResponse
from app.services.rag.ingestion.service import IngestionService

router = APIRouter(prefix="/v1/ingest", tags=["ingest"])


@router.post(
    "/upsert",
    response_model=IngestUpsertResponse,
    summary="Ingest or refresh regulatory sources",
    response_description="Per-source ingestion results including derived metadata.",
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid JWT."},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded."},
        500: {"model": ErrorResponse, "description": "Ingestion pipeline failure."},
    },
)
async def upsert_sources(
    payload: IngestUpsertRequest,
    session=Depends(get_db_session),
) -> IngestUpsertResponse:
    """Queue sources for ingestion into the retrieval index."""
    service = IngestionService(session)
    results = []
    for source in payload.sources:
        result = await service.upsert(source.model_dump())
        results.append(result)
    return IngestUpsertResponse(results=results)
