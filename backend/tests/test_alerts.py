import uuid
import pytest
from fastapi.testclient import TestClient
from tests.conftest import TestingSessionLocal
from app.models.auth import User, Role, UserRole
from app.models.department import Department
from app.models.location import Location
from app.models.complaint import Complaint
from app.models.alert import Alert, Notification
from app.core.security import get_password_hash


def get_token(client: TestClient, email: str, role_name: str, full_name: str = "Test User") -> str:
    db = TestingSessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        if not user:
            role = db.query(Role).filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name, display_name_ml=role_name, display_name_en=role_name)
                db.add(role)
                db.commit()

            suffix = str(abs(hash(email)))[:6]
            user = User(
                id=uuid.uuid4(),
                full_name=full_name,
                email=email,
                phone=f"+9198{suffix}00",
                password_hash=get_password_hash("Password123!"),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.add(UserRole(user_id=user.id, role_id=role.id))
            db.commit()
    finally:
        db.close()

    res = client.post("/api/v1/auth/login", json={"identifier": email, "password": "Password123!"})
    return res.json()["access_token"]


def test_public_get_alerts_empty_or_seeded(client: TestClient):
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_citizen_cannot_broadcast_alert(client: TestClient):
    token = get_token(client, "citizen_alert_block@example.com", "COMMUNITY")
    payload = {
        "title_ml": "അനധികൃത മുന്നറിയിപ്പ്",
        "title_en": "Unauthorized Alert",
        "message_ml": "പരിശോധന",
        "message_en": "Test",
        "alert_level": "CRITICAL",
        "alert_source": "OFFICIAL_WARNING",
    }
    res = client.post(
        "/api/v1/alerts",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403


def test_authority_broadcast_alert_and_user_receives_notification(client: TestClient):
    auth_token = get_token(client, "authority_broadcaster@example.com", "AUTHORITY", "District Collector")
    citizen_token = get_token(client, "citizen_listener@example.com", "COMMUNITY", "Citizen Listener")

    payload = {
        "title_ml": "പെരിയാർ തീരത്ത് കനത്ത ജാഗ്രതാ നിർദ്ദേശം",
        "title_en": "Flash Flood Warning along Periyar Basin",
        "message_ml": "ഡാം ഷട്ടറുകൾ തുറക്കുന്നതിനാൽ താഴ്ന്ന പ്രദേശങ്ങളിലുള്ളവർ സുരക്ഷിത സ്ഥാനങ്ങളിലേക്ക് മാറുക.",
        "message_en": "Dam shutters opening; residents along low-lying river banks must relocate to relief camps immediately.",
        "alert_level": "CRITICAL",
        "alert_source": "OFFICIAL_WARNING",
        "affected_district": "Ernakulam",
    }

    create_res = client.post(
        "/api/v1/alerts",
        json=payload,
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert create_res.status_code == 201
    alert_data = create_res.json()
    assert alert_data["alert_level"] == "CRITICAL"
    assert alert_data["alert_source"] == "OFFICIAL_WARNING"
    assert alert_data["is_active"] is True
    alert_id = alert_data["id"]

    # Public can see this alert
    public_res = client.get("/api/v1/alerts?district=Ernakulam")
    assert public_res.status_code == 200
    alerts = public_res.json()
    assert any(a["id"] == alert_id for a in alerts)

    # Citizen receives in-app broadcast notification
    notif_res = client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert notif_res.status_code == 200
    data = notif_res.json()
    assert data["unread_count"] >= 1
    assert any(n["reference_type"] == "ALERT" and n["reference_id"] == alert_id for n in data["notifications"])

    # Citizen marks notification as read
    first_notif = next(n for n in data["notifications"] if n["reference_id"] == alert_id)
    read_res = client.patch(
        f"/api/v1/notifications/{first_notif['id']}/read",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Deactivate alert
    deact_res = client.patch(
        f"/api/v1/alerts/{alert_id}/deactivate",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert deact_res.status_code == 200
    assert deact_res.json()["is_active"] is False


def test_invalid_alert_source_rejected(client: TestClient):
    auth_token = get_token(client, "authority_invalid_src@example.com", "AUTHORITY")
    payload = {
        "title_ml": "ടെസ്റ്റ്",
        "title_en": "Test",
        "message_ml": "ടെസ്റ്റ്",
        "message_en": "Test",
        "alert_level": "WARNING",
        "alert_source": "BOGUS_SOURCE",
    }
    res = client.post(
        "/api/v1/alerts",
        json=payload,
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert res.status_code == 400
    assert "അസാധുവായ അലേർട്ട് സ്രോതസ്സ്" in res.json()["detail"]


def test_complaint_status_change_dispatches_notification(client: TestClient):
    # 1. Citizen registers and submits complaint
    citizen_token = get_token(client, "notif_citizen@example.com", "COMMUNITY", "Complaining Citizen")
    complaint_payload = {
        "title": "കനത്ത പ്ലാസ്റ്റിക് മാലിന്യ നിക്ഷേപം",
        "description": "തോപ്പുംപടി പാലത്തിന് താഴെ",
        "category": "WASTE",
        "severity": "HIGH",
        "location": {
            "latitude": 9.9312,
            "longitude": 76.2673,
            "district": "Ernakulam",
            "lsgd_type": "MUNICIPALITY",
            "lsgd_name": "Thoppumpady",
        },
    }
    c_res = client.post(
        "/api/v1/complaints",
        json=complaint_payload,
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert c_res.status_code == 201
    complaint = c_res.json()
    complaint_id = complaint["id"]

    # 2. Authority updates status to VERIFIED
    auth_token = get_token(client, "notif_authority@example.com", "AUTHORITY")
    status_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "VERIFIED", "remarks": "സ്ഥലം പരിശോധിക്കാൻ തീരുമാനിച്ചു."},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert status_res.status_code == 200

    # 3. Verify Citizen receives status update notification
    my_notifs = client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert my_notifs.status_code == 200
    notif_list = my_notifs.json()["notifications"]
    status_notif = next((n for n in notif_list if n["reference_id"] == complaint_id), None)
    assert status_notif is not None
    assert "പരിശോധിച്ചു" in status_notif["title"]

    # 4. Mark all as read
    mark_res = client.post(
        "/api/v1/notifications/mark-all-read",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert mark_res.status_code == 200
    assert mark_res.json()["unread_count"] == 0
