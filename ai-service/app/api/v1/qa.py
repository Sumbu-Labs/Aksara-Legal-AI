from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_rag_pipeline
from app.schemas.common import ErrorResponse
from app.schemas.qa import QaRequest, QaResponse
from app.services.rag.pipeline.service import RagPipeline

router = APIRouter(prefix="/v1/qa", tags=["qa"])


@router.post(
    "/query",
    response_model=QaResponse,
    summary="Ask a grounded legal question",
    response_description="Markdown answer with citations and retrieval metadata.",
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid JWT."},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded."},
        500: {"model": ErrorResponse, "description": "Failed to generate an answer."},
    },
)
async def query_qa(
    payload: QaRequest,
    pipeline: RagPipeline = Depends(get_rag_pipeline),
) -> QaResponse:
    """Generate a grounded answer for the supplied legal question."""
    result = await pipeline.answer(payload.model_dump())
    if not result.get("answer_md"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal memproses permintaan",
        )
    if result["answer_md"].startswith("Saya tidak dapat memverifikasi"):
        return QaResponse(
            answer_md=result["answer_md"],
            citations=[],
            retrieval_meta=result.get("retrieval_meta", {}),
            model_meta=result.get("model_meta", {}),
        )
    if not result.get("citations"):
        return QaResponse(
            answer_md="Saya tidak dapat memverifikasi ini.",
            citations=[],
            retrieval_meta=result.get("retrieval_meta", {}),
            model_meta=result.get("model_meta", {}),
        )
    return QaResponse(
        answer_md=result["answer_md"],
        citations=result["citations"],
        retrieval_meta=result.get("retrieval_meta", {}),
        model_meta=result.get("model_meta", {}),
    )
