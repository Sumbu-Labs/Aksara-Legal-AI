from __future__ import annotations

from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from sqlalchemy import exc as sa_exc
from sqlalchemy.ext.asyncio import AsyncEngine

from alembic import context

from app.core.config import get_settings
from app.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url.get_secret_value())

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = AsyncEngine(
        engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
            future=True,
        )
    )

    async def do_run_migrations() -> None:
        async with connectable.connect() as connection:
            await connection.run_sync(lambda conn: context.configure(connection=conn, target_metadata=target_metadata))
            async with context.begin_transaction():
                await connection.run_sync(lambda conn: context.run_migrations())

    import asyncio

    try:
        asyncio.run(do_run_migrations())
    except sa_exc.UnboundExecutionError:
        pass


def run_migrations() -> None:
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()


run_migrations()
