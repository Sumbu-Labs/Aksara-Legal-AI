from __future__ import annotations

from fastapi import APIRouter

from app.schemas.common import ErrorResponse
from app.schemas.workspace import WorkspaceAnalysisRequest, WorkspaceAnalysisResponse
from app.services.workspace.analyzer import WorkspaceAnalyzer

router = APIRouter(prefix="/v1/workspace", tags=["workspace"])
_analyzer = WorkspaceAnalyzer()


@router.post(
    "/analyze",
    response_model=WorkspaceAnalysisResponse,
    summary="Generate workspace tasks and document recommendations",
    response_description="Workspace insight block containing tasks, documents, and summary.",
    responses={
        400: {"model": ErrorResponse, "description": "Payload tidak valid."},
        500: {"model": ErrorResponse, "description": "Analisis workspace gagal diproses."},
    },
)
async def analyze_workspace(payload: WorkspaceAnalysisRequest) -> WorkspaceAnalysisResponse:
    """Run workspace analysis using the AI orchestrator."""
    return await _analyzer.analyze(payload)
