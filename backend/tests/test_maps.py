import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.models.auth import Role, User, UserRole
from app.models.complaint import Complaint, Evidence
from app.models.location import Location
from tests.conftest import TestingSessionLocal


@pytest.fixture(scope="module")
def map_seed_data():
    db = TestingSessionLocal()
    try:
        citizen_role = db.query(Role).filter_by(name="COMMUNITY").first()
        if not citizen_role:
            citizen_role = Role(
                name="COMMUNITY", display_name_ml="പൊതുജനം", display_name_en="Citizen"
            )
            db.add(citizen_role)
            db.commit()

        user = User(
            email="citizen_map_test@naam.kerala.gov.in",
            phone="+919876599999",
            full_name="Kochi Citizen",
            password_hash=get_password_hash("SecretPass123!"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.add(UserRole(user_id=user.id, role_id=citizen_role.id))
        db.commit()

        # Create 3 locations:
        # 1. Kochi (Marine Drive) - Waste
        loc1 = Location(
            latitude=9.9816,
            longitude=76.2763,
            district="Ernakulam",
            lsgd_type="CORPORATION",
            lsgd_name="Kochi Corporation",
            ward_number="45",
        )
        # 2. Aluva (Periyar River) - Water Pollution
        loc2 = Location(
            latitude=10.1076,
            longitude=76.3516,
            district="Ernakulam",
            lsgd_type="MUNICIPALITY",
            lsgd_name="Aluva Municipality",
            ward_number="12",
        )
        # 3. Thiruvananthapuram - Drainage
        loc3 = Location(
            latitude=8.5241,
            longitude=76.9366,
            district="Thiruvananthapuram",
            lsgd_type="CORPORATION",
            lsgd_name="Thiruvananthapuram Corporation",
            ward_number="18",
        )
        db.add_all([loc1, loc2, loc3])
        db.commit()

        # Create complaints
        c1 = Complaint(
            tracking_code=f"NM-MAP-{uuid.uuid4().hex[:6].upper()}",
            title="Marine Drive Waste Accumulation",
            description="Severe plastic waste accumulation near jetty walkway",
            category="WASTE",
            severity="HIGH",
            current_status="IN_PROGRESS",
            reporter_id=user.id,
            location_id=loc1.id,
            is_public=True,
        )
        c2 = Complaint(
            tracking_code=f"NM-MAP-{uuid.uuid4().hex[:6].upper()}",
            title="Industrial Effluent in Periyar River",
            description="Chemical discharge causing discolored water and fish mortality",
            category="WATER_POLLUTION",
            severity="EMERGENCY",
            current_status="SUBMITTED",
            reporter_id=user.id,
            location_id=loc2.id,
            is_public=True,
        )
        c3 = Complaint(
            tracking_code=f"NM-MAP-{uuid.uuid4().hex[:6].upper()}",
            title="Drainage Blockage at Palayam",
            description="Stormwater drain clogged causing local flooding during rains",
            category="DRAINAGE",
            severity="MEDIUM",
            current_status="RESOLVED",
            reporter_id=user.id,
            location_id=loc3.id,
            is_public=True,
        )
        db.add_all([c1, c2, c3])
        db.commit()

        # Add evidence image to c1
        ev1 = Evidence(
            complaint_id=c1.id,
            uploaded_by=user.id,
            file_url="https://storage.googleapis.com/naam-evidence/marine_drive_waste.jpg",
            file_type="image/jpeg",
            file_size_bytes=102400,
            evidence_type="CITIZEN_SUBMISSION",
        )
        db.add(ev1)
        db.commit()

        return {
            "user": user,
            "c1": c1,
            "c2": c2,
            "c3": c3,
            "loc1": loc1,
            "loc2": loc2,
            "loc3": loc3,
        }
    finally:
        db.close()


def test_get_map_clusters_all(client: TestClient, map_seed_data):
    response = client.get("/api/v1/map/clusters")
    assert response.status_code == 200
    data = response.json()
    assert "total_count" in data
    assert "points" in data
    assert "geojson" in data
    assert data["total_count"] >= 3

    # Check GeoJSON structure
    geojson = data["geojson"]
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) >= 3
    feature = geojson["features"][0]
    assert feature["type"] == "Feature"
    assert "geometry" in feature
    assert feature["geometry"]["type"] == "Point"
    assert len(feature["geometry"]["coordinates"]) == 2  # [lon, lat]

    # Verify public PII protection
    for point in data["points"]:
        assert "reporter_id" not in point
        assert "reporter_name" not in point
        assert "reporter_phone" not in point
        assert "reporter_email" not in point


def test_get_map_clusters_category_and_status_filter(client: TestClient, map_seed_data):
    # Filter by category WASTE
    res_waste = client.get("/api/v1/map/clusters?category=WASTE")
    assert res_waste.status_code == 200
    waste_points = res_waste.json()["points"]
    assert len(waste_points) >= 1
    assert all(p["category"] == "WASTE" for p in waste_points)

    # Filter by ACTIVE status (excludes RESOLVED)
    res_active = client.get("/api/v1/map/clusters?status=ACTIVE")
    assert res_active.status_code == 200
    active_points = res_active.json()["points"]
    assert len(active_points) >= 2
    assert all(p["current_status"] != "RESOLVED" for p in active_points)


def test_get_map_clusters_bounding_box(client: TestClient, map_seed_data):
    # Ernakulam bounding box (covers Kochi & Aluva, excludes Thiruvananthapuram)
    res_bb = client.get("/api/v1/map/clusters?min_lat=9.8&max_lat=10.3&min_lng=76.0&max_lng=76.6")
    assert res_bb.status_code == 200
    points = res_bb.json()["points"]
    assert len(points) >= 2
    # Ensure all points inside bounding box
    for p in points:
        assert 9.8 <= p["latitude"] <= 10.3
        assert 76.0 <= p["longitude"] <= 76.6


def test_get_nearby_complaints_proximity(client: TestClient, map_seed_data):
    # Query from Ernakulam Marine Drive (9.9816, 76.2763) within 5 km
    res_nearby = client.get("/api/v1/map/nearby?lat=9.9816&lng=76.2763&radius_km=5.0")
    assert res_nearby.status_code == 200
    points = res_nearby.json()
    assert len(points) >= 1
    closest = points[0]
    assert closest["title"] == "Marine Drive Waste Accumulation"
    assert closest["distance_km"] <= 0.1  # Virtually 0 distance
    assert closest["thumbnail_url"] is not None


def test_get_nearby_out_of_kerala_rejected(client: TestClient):
    # Query coordinates in Delhi (28.6139, 77.2090)
    res = client.get("/api/v1/map/nearby?lat=28.6139&lng=77.2090")
    assert res.status_code == 400
    assert "കേരളത്തിന് പുറത്താണ്" in res.json()["detail"]
