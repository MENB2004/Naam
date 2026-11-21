import uuid
import pytest
from sqlalchemy import select
from tests.conftest import TestingSessionLocal
from app.models.auth import Role, User
from app.models.department import Department
from app.models.location import Location
from app.models.complaint import Complaint


def test_seed_and_query_departments(client):
    with TestingSessionLocal() as session:
        lsgd = Department(
            id=uuid.uuid4(),
            code="LSGD_TEST",
            name_ml="തദ്ദേശ സ്വയംഭരണ വകുപ്പ്",
            name_en="Local Self-Government Department",
            contact_email="lsgd@kerala.gov.in"
        )
        kspcb = Department(
            id=uuid.uuid4(),
            code="KSPCB_TEST",
            name_ml="കേരള സംസ്ഥാന മലിനീകരണ നിയന്ത്രണ ബോർഡ്",
            name_en="Kerala State Pollution Control Board",
            contact_email="kspcb@kerala.gov.in"
        )
        session.add_all([lsgd, kspcb])
        session.commit()

    resp_dept = client.get("/api/v1/departments")
    assert resp_dept.status_code == 200
    depts = resp_dept.json()
    assert len(depts) >= 2
    codes = [d["code"] for d in depts]
    assert "LSGD_TEST" in codes

    resp_roles = client.get("/api/v1/roles")
    assert resp_roles.status_code == 200
    roles = resp_roles.json()
    assert any(r["name"] == "COMMUNITY" for r in roles)


def test_create_location_and_complaint(client):
    with TestingSessionLocal() as session:
        reporter = User(
            id=uuid.uuid4(),
            full_name="Rajesh Kumar",
            email="rajesh.kumar@example.com",
            password_hash="test_argon2_hash"
        )
        session.add(reporter)
        session.flush()

        loc = Location(
            id=uuid.uuid4(),
            latitude=9.9675,
            longitude=76.3184,
            district="Ernakulam",
            lsgd_type="MUNICIPALITY",
            lsgd_name="Kochi Corporation",
            ward_number="42",
            landmark="Near Vyttila Mobility Hub"
        )
        session.add(loc)
        session.flush()

        comp = Complaint(
            id=uuid.uuid4(),
            tracking_code="NAAM-2026-TEST01",
            title="Roadside plastic waste dumping",
            description="Large accumulation of plastic waste blocking storm drain.",
            category="SOLID_WASTE",
            severity="HIGH",
            current_status="SUBMITTED",
            reporter_id=reporter.id,
            location_id=loc.id
        )
        session.add(comp)
        session.commit()

        stmt = select(Complaint).where(Complaint.tracking_code == "NAAM-2026-TEST01")
        result = session.scalars(stmt).one()
        assert result.title == "Roadside plastic waste dumping"
        assert result.category == "SOLID_WASTE"
        assert result.severity == "HIGH"
        assert result.current_status == "SUBMITTED"
        assert result.reporter.full_name == "Rajesh Kumar"
        assert result.location.district == "Ernakulam"
