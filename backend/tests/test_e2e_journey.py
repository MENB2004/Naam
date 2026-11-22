import uuid

from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.models.auth import Role, User, UserRole
from app.models.department import Department
from tests.conftest import TestingSessionLocal


def create_test_user_with_role(db, full_name: str, email: str, role_name: str, dept_id=None):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        role = db.query(Role).filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name, display_name_ml=role_name, display_name_en=role_name)
            db.add(role)
            db.commit()

        user = User(
            id=uuid.uuid4(),
            full_name=full_name,
            email=email,
            phone=f"+9198{uuid.uuid4().hex[:8]}",
            password_hash=get_password_hash("SecureE2EPass123!"),
            department_id=dept_id,
            is_active=True,
            preferred_language="ml",
        )
        db.add(user)
        db.commit()
        db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()
    return user


def test_complete_e2e_user_journey(client: TestClient):
    """
    Complete E2E Journey:
    1. Citizen registers & submits complaint
    2. Authority triages, verifies & assigns to Field Officer
    3. Field Officer inspects, updates status to IN_PROGRESS & resolves with proof photos
    4. Citizen checks public tracking & timeline
    """
    db = TestingSessionLocal()
    try:
        # 1. Setup Department & Field Officer
        dept = db.query(Department).filter_by(code="KSPCB").first()
        if not dept:
            dept = Department(
                id=uuid.uuid4(),
                code="KSPCB",
                name_ml="കേരള സംസ്ഥാന മലിനീകരണ നിയന്ത്രണ ബോർഡ്",
                name_en="Kerala State Pollution Control Board",
                contact_email="kspcb@kerala.gov.in",
                is_active=True,
            )
            db.add(dept)
            db.commit()

        officer_user = create_test_user_with_role(
            db, "Officer Suresh Kumar", "officer_suresh_e2e@example.com", "OFFICER", dept.id
        )
        officer_id = str(officer_user.id)
        authority_user = create_test_user_with_role(
            db, "Authority Ramesh Menon", "auth_ramesh_e2e@example.com", "AUTHORITY", dept.id
        )
        str(authority_user.id)
    finally:
        db.close()

    # Step 1: Citizen Registration & Login
    citizen_email = f"citizen_e2e_{uuid.uuid4().hex[:6]}@example.com"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Deepa Nair",
            "email": citizen_email,
            "password": "CitizenSecure123!",
            "phone": f"+9198{uuid.uuid4().hex[:8]}",
            "preferred_language": "ml",
            "privacy_consent": True,
        },
    )
    assert reg_res.status_code == 201
    citizen_token = reg_res.json()["access_token"]

    # Step 2: Citizen Submits Complaint
    complaint_payload = {
        "title": "Severe Plastic Dumping in Periyar River",
        "description": "Massive plastic accumulation obstructing water flow near Aluva bridge",
        "category": "WATER_POLLUTION",
        "severity": "HIGH",
        "location": {
            "latitude": 10.1076,
            "longitude": 76.3516,
            "district": "Ernakulam",
            "lsgd_type": "MUNICIPALITY",
            "lsgd_name": "Aluva Municipality",
            "ward_number": "14",
            "landmark": "Near Aluva Sivarathri Manappuram",
        },
        "evidence": [
            {
                "file_url": "https://storage.naam.kerala.gov.in/evidence/dump_01.jpg",
                "file_type": "image/jpeg",
                "file_size_bytes": 1048576,
                "evidence_type": "CITIZEN_SUBMISSION",
            }
        ],
    }

    create_res = client.post(
        "/api/v1/complaints",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json=complaint_payload,
    )
    assert create_res.status_code == 201
    complaint = create_res.json()
    complaint_id = complaint["id"]
    tracking_code = complaint["tracking_code"]
    assert complaint["current_status"] == "SUBMITTED"
    assert tracking_code.startswith("NAAM-")

    # Step 3: Authority Login & Triage Review
    auth_login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "auth_ramesh_e2e@example.com", "password": "SecureE2EPass123!"},
    )
    assert auth_login_res.status_code == 200
    auth_token = auth_login_res.json()["access_token"]

    triage_res = client.get(
        "/api/v1/complaints?status=SUBMITTED",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert triage_res.status_code == 200
    triage_queue = triage_res.json()
    assert any(c["id"] == complaint_id for c in triage_queue)

    # Authority verifies complaint
    verify_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "new_status": "VERIFIED",
            "remarks": "Verified complaint through satellite view and local municipal coordinator.",
        },
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["current_status"] == "VERIFIED"

    # Authority assigns complaint to Field Officer
    assign_res = client.post(
        f"/api/v1/complaints/{complaint_id}/assign",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "assigned_to_id": officer_id,
            "instructions": "Inspect site and coordinate clean-up with Haritha Karma Sena.",
        },
    )
    assert assign_res.status_code == 200
    assert assign_res.json()["current_status"] == "ASSIGNED"

    # Step 4: Field Officer Logs in & Handles Tasks
    officer_login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "officer_suresh_e2e@example.com", "password": "SecureE2EPass123!"},
    )
    assert officer_login_res.status_code == 200
    officer_token = officer_login_res.json()["access_token"]

    tasks_res = client.get(
        "/api/v1/complaints/officer/tasks",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert tasks_res.status_code == 200
    officer_tasks = tasks_res.json()
    assert any(t["id"] == complaint_id for t in officer_tasks)

    # Officer marks task IN_PROGRESS
    progress_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "new_status": "IN_PROGRESS",
            "remarks": "On site. Excavator and volunteer team deployed for debris clearance.",
        },
    )
    assert progress_res.status_code == 200
    assert progress_res.json()["current_status"] == "IN_PROGRESS"

    # Officer submits photographic resolution proof & resolves
    resolve_res = client.post(
        f"/api/v1/complaints/{complaint_id}/resolve",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "resolution_notes": "All plastic debris removed; flow restored. Warning sign board erected.",
            "evidence_photos": [
                {
                    "file_url": "https://storage.naam.kerala.gov.in/evidence/resolved_river_clean.jpg",
                    "file_type": "image/jpeg",
                    "file_size_bytes": 2097152,
                    "evidence_type": "FIELD_RESOLUTION_PROOF",
                }
            ],
        },
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["current_status"] == "RESOLVED"

    # Step 5: Citizen & Public Tracking Verification
    track_res = client.get(f"/api/v1/complaints/track/{tracking_code}")
    assert track_res.status_code == 200
    tracked_data = track_res.json()
    assert tracked_data["current_status"] == "RESOLVED"
    assert tracked_data["tracking_code"] == tracking_code

    # Verify complete timeline integrity
    timeline_res = client.get(
        f"/api/v1/complaints/{complaint_id}/timeline",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline) >= 4
    statuses = [t["new_status"] for t in timeline]
    assert "SUBMITTED" in statuses
    assert "VERIFIED" in statuses
    assert "ASSIGNED" in statuses
    assert "IN_PROGRESS" in statuses
    assert "RESOLVED" in statuses
