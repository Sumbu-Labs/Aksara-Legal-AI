from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

TaskStatus = Literal["todo", "in_progress", "blocked", "done"]
TaskPriority = Literal["high", "medium", "low"]
DocumentStatus = Literal["missing", "collecting", "ready", "submitted"]
OverallStatus = Literal["on_track", "at_risk", "blocked"]
RiskLevel = Literal["low", "medium", "high"]


class WorkspaceDocumentInput(BaseModel):
    """Snapshot of an uploaded document available for analysis."""

    id: str | None = Field(default=None, description="Stable identifier when available")
    label: str | None = Field(default=None, description="Document display name")
    permit_type: str | None = Field(default=None, description="Permit type this document supports")
    filename: str | None = Field(default=None, description="Original filename")
    size: int | None = Field(default=None, description="File size in bytes")
    metadata: dict[str, Any] | None = Field(default=None, description="Structured metadata inferred at upload")
    notes: str | None = Field(default=None, description="Additional operator notes")
    uploaded_at: str | None = Field(default=None, description="ISO timestamp when document was uploaded")
    updated_at: str | None = Field(default=None, description="ISO timestamp for the latest update")


class WorkspacePermitInput(BaseModel):
    """Permit-level signals sent to the analyzer."""

    permit_type: str = Field(..., description="Permit identifier e.g. PIRT, HALAL, BPOM")
    is_checklist_complete: bool = Field(default=False, description="Whether all fields for this permit are marked complete")
    field_checklist: dict[str, Any] | None = Field(default=None, description="Per-field status emitted by the product")
    documents: dict[str, Any] | None = Field(default=None, description="Document linkage metadata surfaced by the user")
    updated_at: str | None = Field(default=None, description="ISO timestamp of the latest update for this permit")


class WorkspaceAnalysisRequest(BaseModel):
    """Payload describing the current workspace context."""

    business_profile: dict[str, Any] | None = Field(
        default=None,
        description="Full business profile as returned by the backend. May be null when user has not completed onboarding.",
    )
    permits: list[WorkspacePermitInput] = Field(
        default_factory=list,
        description="Permit records containing checklist status information.",
    )
    documents: list[WorkspaceDocumentInput] = Field(
        default_factory=list,
        description="Documents currently available for compliance tasks.",
    )
    locale: str = Field(default="id-ID", description="Locale hint for the generator")


class WorkspaceTask(BaseModel):
    """Actionable compliance task produced by the analyzer."""

    id: str = Field(..., description="Stable identifier for UI rendering")
    title: str = Field(..., description="Short task title")
    status: TaskStatus = Field(..., description="Current workflow status for the task")
    priority: TaskPriority = Field(default="medium", description="Relative urgency")
    permit_type: str | None = Field(default=None, description="Permit most related to the task")
    description: str = Field(..., description="Concise explanation of the task scope")
    next_actions: list[str] = Field(default_factory=list, description="Concrete user actions required next")
    related_documents: list[str] = Field(default_factory=list, description="Document IDs or labels that unblock this task")
    due_date: str | None = Field(default=None, description="ISO date when the task should be completed, if any")
    blocked_reason: str | None = Field(default=None, description="Reason the task is blocked, when status=blocked")


class WorkspaceDocumentRecommendation(BaseModel):
    """Document readiness summary produced by the analyzer."""

    id: str = Field(..., description="Identifier referencing an existing or expected document")
    title: str = Field(..., description="Readable document name")
    status: DocumentStatus = Field(..., description="Readiness state for the document")
    permit_type: str | None = Field(default=None, description="Permit the document supports")
    summary: str = Field(..., description="Short note about current status")
    required_actions: list[str] = Field(default_factory=list, description="Actions needed to reach readiness")
    linked_tasks: list[str] = Field(default_factory=list, description="Task IDs that depend on this document")


class WorkspaceSummary(BaseModel):
    """High level insight for the workspace."""

    headline: str = Field(..., description="Primary insight for the user")
    overall_status: OverallStatus = Field(..., description="Macro status for the workspace")
    risk_level: RiskLevel = Field(..., description="Risk assessment derived from tasks and documents")
    next_action: str = Field(..., description="Recommended immediate follow-up")


class WorkspaceAnalysisResponse(BaseModel):
    """Analyzer output consumed by downstream services."""

    summary: WorkspaceSummary = Field(..., description="Workspace level insight block")
    tasks: list[WorkspaceTask] = Field(default_factory=list, description="Actionable compliance tasks")
    documents: list[WorkspaceDocumentRecommendation] = Field(default_factory=list, description="Document readiness summaries")


__all__ = [
    "WorkspaceAnalysisRequest",
    "WorkspaceAnalysisResponse",
    "WorkspaceDocumentInput",
    "WorkspaceDocumentRecommendation",
    "WorkspacePermitInput",
    "WorkspaceSummary",
    "WorkspaceTask",
]
