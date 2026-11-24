from logging.config import fileConfig
import ssl

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import Connection, make_url

import app.models  # noqa
from app.core.config import settings
from app.core.database import Base

# this is the Alembic Config object
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


def run_sync_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    database_url = make_url(settings.DATABASE_URL)
    connect_args = {}
    if database_url.get_backend_name() == "postgresql":
        # Match the app's Neon/pg8000 connection handling: pg8000 uses an
        # SSLContext instead of libpq's sslmode/channel_binding URL options.
        database_url = database_url.set(drivername="postgresql+pg8000", query={})
        connect_args["ssl_context"] = ssl.create_default_context()
    configuration["sqlalchemy.url"] = str(database_url)

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        connect_args=connect_args,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)
    connectable.dispose()


def run_migrations_online() -> None:
    run_sync_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
