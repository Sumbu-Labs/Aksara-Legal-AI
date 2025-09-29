from __future__ import annotations

import enum
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DocumentType(str, enum.Enum):
    HTML = "html"
    PDF = "pdf"
    MARKDOWN = "markdown"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    type: Mapped[DocumentType] = mapped_column(Enum(DocumentType, name="document_type"), nullable=False)
    uploaded_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    sha256: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    chunks: Mapped[list[Chunk]] = relationship(back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_metadata: Mapped[dict[str, object]] = mapped_column("metadata", JSONB, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector, nullable=False)

    document: Mapped[Document] = relationship(back_populates="chunks")


class Template(Base):
    __tablename__ = "templates"

    permit_type: Mapped[str] = mapped_column(String(32), primary_key=True)
    region: Mapped[str] = mapped_column(String(32), primary_key=True)
    json_schema: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False)
    html_template_url: Mapped[str] = mapped_column(String(512), nullable=False)
    version_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AutopilotJobStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    MISSING = "missing_required_fields"


class AutopilotJob(Base):
    __tablename__ = "autopilot_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    permit_type: Mapped[str] = mapped_column(String(32), nullable=False)
    region: Mapped[str] = mapped_column(String(32), nullable=False)
    input_json: Mapped[dict[str, object]] = mapped_column(JSONB, nullable=False)
    field_audit: Mapped[dict[str, object] | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[AutopilotJobStatus] = mapped_column(
        Enum(AutopilotJobStatus, name="autopilot_status"),
        nullable=False,
    )
    doc_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
