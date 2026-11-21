import uuid
from collections.abc import Generator

import geoalchemy2.admin.dialects.sqlite
from sqlalchemy import Column, DateTime, create_engine, event, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

# If running on SQLite (local dev or test fallback), disable SpatiaLite DDL crashes
if "sqlite" in settings.DATABASE_URL:
    geoalchemy2.admin.dialects.sqlite.after_create = lambda *args, **kwargs: None
    geoalchemy2.admin.dialects.sqlite.before_drop = lambda *args, **kwargs: None

connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)

# Register pure-Python spatial shims into SQLite connections
if "sqlite" in settings.DATABASE_URL:

    @event.listens_for(engine, "connect")
    def setup_sqlite_spatial_shims(dbapi_connection, connection_record):
        dbapi_connection.create_function("GeomFromEWKT", 1, lambda x: x)
        dbapi_connection.create_function("AsEWKB", 1, lambda x: x)
        dbapi_connection.create_function("RecoverGeometryColumn", 5, lambda *args: 1)
        dbapi_connection.create_function("DiscardGeometryColumn", 2, lambda *args: 1)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class TimestampedBase(Base):
    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
