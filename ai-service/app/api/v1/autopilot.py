from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_autopilot_service
from app.schemas.autopilot import (
    AutopilotMissingResponse,
    AutopilotRequest,
    AutopilotSuccessResponse,
)
from app.schemas.common import ErrorResponse
from app.services.autopilot.service import AutopilotService

router = APIRouter(prefix="/v1/autopilot", tags=["autopilot"])


@router.post(
    "/generate",
    response_model=AutopilotSuccessResponse | AutopilotMissingResponse,
    summary="Generate permit application documents",
    response_description="Signed URLs and audit trail when generation succeeds, otherwise guidance for missing inputs.",
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid JWT."},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded."},
        500: {"model": ErrorResponse, "description": "Unexpected error during generation."},
    },
)
async def generate_document(
    payload: AutopilotRequest,
    service: AutopilotService = Depends(get_autopilot_service),
) -> AutopilotSuccessResponse | AutopilotMissingResponse:
    """Create a permit application draft using template-driven Autopilot."""
    try:
        result = await service.generate(payload.model_dump())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    if result["status"] == "ok":
        return AutopilotSuccessResponse(**result)
    return AutopilotMissingResponse(**result)
