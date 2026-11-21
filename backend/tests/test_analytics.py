import uuid

from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.models.auth import Role, User, UserRole
from app.models.complaint import Complaint
from app.models.location import Location
from tests.conftest import TestingSessionLocal


def test_analytics_overview_empty_or_existing(client: TestClient):
    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_complaints" in data
    assert "resolved_complaints" in data
    assert "in_progress_complaints" in data
    assert "pending_complaints" in data
    assert "resolution_rate" in data
    assert "average_resolution_hours" in data
    assert "active_alerts" in data


def test_analytics_categories(client: TestClient):
    res = client.get("/api/v1/analytics/categories")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 8  # Standard categories
    for item in data:
        assert "category" in item
        assert "category_name_ml" in item
        assert "category_name_en" in item
        assert "count" in item
        assert "percentage" in item
        assert "color" in item


def test_analytics_districts(client: TestClient):
    res = client.get("/api/v1/analytics/districts")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 14  # Exactly 14 Kerala districts
    district_names = [d["district"] for d in data]
    assert "Thiruvananthapuram" in district_names
    assert "Ernakulam" in district_names
    assert "Kozhikode" in district_names


def test_analytics_trends(client: TestClient):
    res = client.get("/api/v1/analytics/trends?days=7")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 7
    for point in data:
        assert "date" in point
        assert "reported" in point
        assert "resolved" in point


def test_analytics_summary(client: TestClient):
    res = client.get("/api/v1/analytics/summary?days=14")
    assert res.status_code == 200
    data = res.json()
    assert "overview" in data
    assert "categories" in data
    assert "districts" in data
    assert "trends" in data
    assert len(data["districts"]) == 14


def test_analytics_export_csv(client: TestClient):
    res = client.get("/api/v1/analytics/export?format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment; filename=" in res.headers.get("content-disposition", "")
    content = res.text
    assert "Tracking Code" in content
    assert "District" in content


def test_analytics_export_json(client: TestClient):
    res = client.get("/api/v1/analytics/export?format=json")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_analytics_calculations_with_seeded_data(client: TestClient):
    db = TestingSessionLocal()
    try:
        # Create reporter
        user = db.query(User).filter_by(email="analytics_tester@example.com").first()
        if not user:
            role = db.query(Role).filter_by(name="COMMUNITY").first()
            if not role:
                role = Role(name="COMMUNITY", display_name_ml="പൗരൻ", display_name_en="Citizen")
                db.add(role)
                db.commit()

            user = User(
                id=uuid.uuid4(),
                full_name="Analytics Tester",
                email="analytics_tester@example.com",
                phone="+919876543299",
                password_hash=get_password_hash("SecretPass123!"),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.add(UserRole(user_id=user.id, role_id=role.id))
            db.commit()

        # Create 2 locations in Thrissur and Wayanad
        loc1 = Location(
            id=uuid.uuid4(),
            latitude=10.5276,
            longitude=76.2144,
            district="Thrissur",
            lsgd_type="CORPORATION",
            lsgd_name="Thrissur Corporation",
        )
        loc2 = Location(
            id=uuid.uuid4(),
            latitude=11.6854,
            longitude=76.1320,
            district="Wayanad",
            lsgd_type="GRAMA_PANCHAYAT",
            lsgd_name="Vythiri Grama Panchayat",
        )
        db.add_all([loc1, loc2])
        db.commit()

        # Complaint 1: SUBMITTED, category WASTE
        comp1 = Complaint(
            id=uuid.uuid4(),
            tracking_code=f"KL-ANA-{uuid.uuid4().hex[:6].upper()}",
            title="Waste in Thrissur Market",
            description="Illegal dumping near vegetable stalls",
            category="WASTE",
            severity="HIGH",
            current_status="SUBMITTED",
            reporter_id=user.id,
            location_id=loc1.id,
        )
        # Complaint 2: RESOLVED, category WATER_POLLUTION
        comp2 = Complaint(
            id=uuid.uuid4(),
            tracking_code=f"KL-ANA-{uuid.uuid4().hex[:6].upper()}",
            title="Pond contamination Wayanad",
            description="Chemical runoff into community pond",
            category="WATER_POLLUTION",
            severity="CRITICAL",
            current_status="RESOLVED",
            reporter_id=user.id,
            location_id=loc2.id,
        )
        db.add_all([comp1, comp2])
        db.commit()

    finally:
        db.close()

    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()

    overview = data["overview"]
    assert overview["total_complaints"] >= 2
    assert overview["resolved_complaints"] >= 1
    assert overview["resolution_rate"] > 0

    # Verify categories
    cats = {c["category"]: c for c in data["categories"]}
    assert cats["WASTE"]["count"] >= 1
    assert cats["WATER_POLLUTION"]["count"] >= 1

    # Verify districts
    districts = {d["district"]: d for d in data["districts"]}
    assert districts["Thrissur"]["total"] >= 1
    assert districts["Wayanad"]["total"] >= 1
    assert districts["Wayanad"]["resolved"] >= 1
