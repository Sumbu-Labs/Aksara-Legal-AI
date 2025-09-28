from fastapi import APIRouter, Depends

from app.api.deps import get_db_session
from app.schemas.ingest import IngestUpsertRequest, IngestUpsertResponse
from app.services.rag.ingestion.service import IngestionService

router = APIRouter(prefix="/v1/ingest", tags=["ingest"])


@router.post("/upsert", response_model=IngestUpsertResponse)
async def upsert_sources(
    payload: IngestUpsertRequest,
    session=Depends(get_db_session),
) -> IngestUpsertResponse:
    service = IngestionService(session)
    results = []
    for source in payload.sources:
        result = await service.upsert(source.model_dump())
        results.append(result)
    return IngestUpsertResponse(results=results)
