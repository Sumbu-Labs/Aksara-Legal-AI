from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.api.deps import get_db_session
from app.schemas.common import ErrorResponse
from app.schemas.templates import TemplateResponse
from app.services.autopilot.templates.service import TemplateService

router = APIRouter(prefix="/v1/templates", tags=["templates"])


@router.get(
    "/{permit_type}",
    response_model=TemplateResponse,
    summary="Fetch template schema for a permit type",
    response_description="Template metadata and JSON schema for the requested permit.",
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid JWT."},
        404: {"model": ErrorResponse, "description": "Template not found for the given permit type."},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded."},
    },
)
async def get_template(
    permit_type: str = Path(..., pattern="^(PIRT|HALAL|BPOM)$"),
    session=Depends(get_db_session),
) -> TemplateResponse:
    """Retrieve the JSON schema backing Autopilot for a permit type."""
    service = TemplateService(session)
    schema = await service.get_schema(permit_type, "DIY")
    if not schema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template tidak ditemukan",
        )
    return TemplateResponse(permit_type=permit_type, region="DIY", schema_data=schema)
