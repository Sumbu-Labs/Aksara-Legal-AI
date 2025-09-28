from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_autopilot_service
from app.schemas.autopilot import (
    AutopilotMissingResponse,
    AutopilotRequest,
    AutopilotSuccessResponse,
)
from app.services.autopilot.service import AutopilotService

router = APIRouter(prefix="/v1/autopilot", tags=["autopilot"])


@router.post("/generate", response_model=Union[AutopilotSuccessResponse, AutopilotMissingResponse])
async def generate_document(
    payload: AutopilotRequest,
    service: AutopilotService = Depends(get_autopilot_service),
) -> Union[AutopilotSuccessResponse, AutopilotMissingResponse]:
    try:
        result = await service.generate(payload.model_dump())
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    if result["status"] == "ok":
        return AutopilotSuccessResponse(**result)
    return AutopilotMissingResponse(**result)
