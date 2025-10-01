from __future__ import annotations

import json
from typing import Any

from app.core.logging import get_logger
from app.core.prompts import get_prompt
from app.schemas.workspace import (
    WorkspaceAnalysisRequest,
    WorkspaceAnalysisResponse,
)
from app.services.llm.gemini import get_gemini_client

logger = get_logger(__name__)


def _slugify(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = "".join(ch if ch.isalnum() or ch in {"-", "_", " ", "/"} else "-" for ch in value)
    slug = "-".join(part for part in cleaned.replace("/", "-").split() if part)
    slug = slug.lower().strip("-")
    return slug or None


class WorkspaceAnalyzer:
    """LLM-backed analyzer that consolidates workspace insights."""

    def __init__(self) -> None:
        self._prompt = get_prompt("workspace analysis prompt")
        self._gemini = get_gemini_client()

    async def analyze(self, payload: WorkspaceAnalysisRequest) -> WorkspaceAnalysisResponse:
        context = payload.model_dump(mode="json")
        candidate = await self._invoke_llm(context)
        merged = self._merge_with_fallback(payload, candidate)
        return WorkspaceAnalysisResponse.model_validate(merged)

    async def _invoke_llm(self, context: dict[str, Any]) -> dict[str, Any]:
        if not self._prompt:
            logger.warning("workspace_prompt_missing")
            return {}
        try:
            response = await self._gemini.call_resolver(self._prompt, context)
        except Exception as exc:  # pragma: no cover - network failure path
            logger.warning("workspace_llm_error", error=str(exc))
            return {}
        return self._parse_response(response)

    def _parse_response(self, response: dict[str, Any]) -> dict[str, Any]:
        try:
            text = response["candidates"][0]["content"]["parts"][0]["text"]
            data = json.loads(text)
            if isinstance(data, dict):
                return data
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
            logger.warning("workspace_parse_failed", error=str(exc), response=response)
        return {}

    def _merge_with_fallback(
        self,
        request: WorkspaceAnalysisRequest,
        candidate: dict[str, Any],
    ) -> dict[str, Any]:
        fallback = self._build_fallback(request)
        summary = candidate.get("summary") or fallback["summary"]
        tasks = candidate.get("tasks") or fallback["tasks"]
        documents = candidate.get("documents") or fallback["documents"]
        return {
            "summary": summary,
            "tasks": tasks,
            "documents": documents,
        }

    def _build_fallback(self, request: WorkspaceAnalysisRequest) -> dict[str, Any]:
        documents, doc_map = self._build_document_recommendations(request)
        tasks = self._build_tasks(request, documents, doc_map)
        summary = self._build_summary(request, tasks)
        return {
            "summary": summary,
            "tasks": tasks,
            "documents": documents,
        }

    def _build_document_recommendations(
        self, request: WorkspaceAnalysisRequest
    ) -> tuple[list[dict[str, Any]], dict[str | None, list[str]]]:
        recommendations: list[dict[str, Any]] = []
        by_permit: dict[str | None, list[str]] = {}
        if request.documents:
            for index, document in enumerate(request.documents, start=1):
                doc_id = document.id or _slugify(document.label or document.filename) or f"doc-{index}"
                status = "ready" if document.metadata else "collecting"
                summary = (
                    f"Dokumen {document.label or document.filename or doc_id} sudah diunggah"
                    if status == "ready"
                    else "Dokumen terunggah, lengkapi metadata untuk verifikasi"
                )
                actions = [] if status == "ready" else ["Tambahkan metadata wajib", "Verifikasi kesesuaian dengan checklist"]
                recommendations.append(
                    {
                        "id": doc_id,
                        "title": document.label or document.filename or "Dokumen Pendukung",
                        "status": status,
                        "permit_type": document.permit_type,
                        "summary": summary,
                        "required_actions": actions,
                        "linked_tasks": [],
                    }
                )
                by_permit.setdefault(document.permit_type, []).append(doc_id)
        return recommendations, by_permit

    def _build_tasks(
        self,
        request: WorkspaceAnalysisRequest,
        documents: list[dict[str, Any]],
        doc_map: dict[str | None, list[str]],
    ) -> list[dict[str, Any]]:
        tasks: list[dict[str, Any]] = []
        if not request.business_profile:
            tasks.append(
                self._task_dict(
                    task_id="complete-business-profile",
                    title="Lengkapi profil bisnis",
                    status="todo",
                    priority="high",
                    description="Isi data usaha agar AI dapat menyusun checklist izin yang akurat.",
                    permit_type=None,
                    next_actions=["Isi nama usaha", "Pilih jenis & skala bisnis", "Simpan profil"],
                    related_documents=[],
                )
            )
        for permit in request.permits:
            doc_ids = doc_map.get(permit.permit_type, [])
            if not doc_ids:
                placeholder_id = f"{_slugify(permit.permit_type) or 'izin'}-dokumen"
                documents.append(
                    {
                        "id": placeholder_id,
                        "title": f"Dokumen {permit.permit_type}",
                        "status": "missing",
                        "permit_type": permit.permit_type,
                        "summary": "Belum ada dokumen pendukung yang diunggah.",
                        "required_actions": ["Unggah dokumen persyaratan"],
                        "linked_tasks": [],
                    }
                )
                doc_map.setdefault(permit.permit_type, []).append(placeholder_id)
                doc_ids = [placeholder_id]
            if permit.is_checklist_complete:
                status = "done"
                priority = "low"
                description = f"Checklist {permit.permit_type} telah lengkap. Siap proses pengajuan."
                next_actions = ["Siapkan jadwal pengajuan ke instansi"]
            else:
                has_docs = any(doc_id for doc_id in doc_ids)
                status = "in_progress" if has_docs else "todo"
                priority = "high" if not has_docs else "medium"
                description = (
                    f"Lengkapi field wajib untuk izin {permit.permit_type}."
                    if has_docs
                    else f"Mulai kumpulkan persyaratan izin {permit.permit_type}."
                )
                next_actions = [
                    f"Tinjau checklist izin {permit.permit_type}",
                    "Unggah bukti pendukung utama",
                ]
            tasks.append(
                self._task_dict(
                    task_id=f"permit-{_slugify(permit.permit_type) or 'izin'}",
                    title=f"Izin {permit.permit_type}",
                    status=status,
                    priority=priority,
                    description=description,
                    permit_type=permit.permit_type,
                    next_actions=next_actions,
                    related_documents=doc_ids,
                )
            )
        if not tasks:
            tasks.append(
                self._task_dict(
                    task_id="schedule-discovery",
                    title="Analisis kebutuhan izin",
                    status="todo",
                    priority="high",
                    description="Gunakan chatbot untuk memetakan izin apa saja yang relevan bagi usaha Anda.",
                    permit_type=None,
                    next_actions=["Buka toolbar AI", "Jelaskan profil usaha", "Konfirmasi rekomendasi"],
                    related_documents=[],
                )
            )
        return tasks

    def _build_summary(
        self, request: WorkspaceAnalysisRequest, tasks: list[dict[str, Any]]
    ) -> dict[str, Any]:
        total = len(tasks)
        done = sum(1 for task in tasks if task["status"] == "done")
        if total == 0:
            overall = "at_risk"
            risk = "medium"
        elif done == total:
            overall = "on_track"
            risk = "low"
        else:
            overall = "at_risk"
            risk = "medium"
        headline = "Profil bisnis belum lengkap" if not request.business_profile else "Checklist izin perlu ditindaklanjuti"
        next_action = "Buka toolbar AI dan lengkapi data profil" if not request.business_profile else "Prioritaskan izin dengan status TODO"
        return {
            "headline": headline,
            "overall_status": overall,
            "risk_level": risk,
            "next_action": next_action,
        }

    @staticmethod
    def _task_dict(
        *,
        task_id: str,
        title: str,
        status: str,
        priority: str,
        description: str,
        permit_type: str | None,
        next_actions: list[str],
        related_documents: list[str],
    ) -> dict[str, Any]:
        return {
            "id": task_id,
            "title": title,
            "status": status,
            "priority": priority,
            "permit_type": permit_type,
            "description": description,
            "next_actions": next_actions,
            "related_documents": related_documents,
            "due_date": None,
            "blocked_reason": None,
        }


__all__ = ["WorkspaceAnalyzer"]
