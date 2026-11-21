import os
import uuid

import geoalchemy2.admin.dialects.sqlite
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
os.environ["TESTING"] = "1"

# Completely disable GeoAlchemy2 SQLite DDL hooks so SQLite tests run smoothly
geoalchemy2.admin.dialects.sqlite.after_create = lambda *args, **kwargs: None
geoalchemy2.admin.dialects.sqlite.before_drop = lambda *args, **kwargs: None
geoalchemy2.admin.dialects.sqlite.after_drop = lambda *args, **kwargs: None

from app.core.database import Base, get_db
from app.main import app
from app.models.auth import Role

TEST_DB_FILE = os.path.join(os.path.dirname(__file__), "test_suite.db")
if os.path.exists(TEST_DB_FILE):
    try:
        os.remove(TEST_DB_FILE)
    except OSError:
        pass

test_engine = create_engine(
    f"sqlite:///{TEST_DB_FILE}",
    connect_args={"check_same_thread": False},
)


@event.listens_for(test_engine, "connect")
def setup_sqlite_spatial_shims(dbapi_connection, connection_record):
    dbapi_connection.create_function("GeomFromEWKT", 1, lambda x: x)
    dbapi_connection.create_function("AsEWKB", 1, lambda x: x)
    dbapi_connection.create_function("RecoverGeometryColumn", 5, lambda *args: 1)
    dbapi_connection.create_function("DiscardGeometryColumn", 2, lambda *args: 1)


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def init_test_database():
    Base.metadata.create_all(bind=test_engine)
    with TestingSessionLocal() as session:
        for r_name, r_ml, r_en in [
            ("COMMUNITY", "പൗരൻ", "Citizen"),
            ("AUTHORITY", "അധികാരി", "Authority"),
            ("OFFICER", "ഫീൽഡ് ഓഫീസർ", "Field Officer"),
            ("SUPER_ADMIN", "സിസ്റ്റം അഡ്മിൻ", "Super Admin"),
        ]:
            session.add(
                Role(id=uuid.uuid4(), name=r_name, display_name_ml=r_ml, display_name_en=r_en)
            )
        session.commit()
    yield
    test_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)
