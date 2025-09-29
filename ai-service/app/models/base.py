
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, declared_attr, mapped_column


def _naming_convention() -> dict[str, str]:
    return {
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=_naming_convention())

    if TYPE_CHECKING:
        __tablename__: str
    else:
        @classmethod
        @declared_attr.directive
        def __tablename__(cls) -> str:
            return cls.__name__.lower()

    created_at = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        nullable=False,
    )


class TimestampMixin:
    created_at = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        nullable=False,
    )
    updated_at = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class AuditMixin:
    created_by = mapped_column(nullable=True)
    updated_by = mapped_column(nullable=True)
    created_at = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        nullable=False,
    )
    updated_at = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
