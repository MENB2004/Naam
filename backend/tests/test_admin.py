import uuid
import pytest
from fastapi.testclient import TestClient
from tests.conftest import TestingSessionLocal
from app.models.auth import User, Role, UserRole, AuditLog
from app.core.security import get_password_hash


def get_token(client: TestClient, email: str, role_name: str, full_name: str = "Admin User") -> str:
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
                phone=f"+9199{suffix}00",
                password_hash=get_password_hash("AdminPass123!"),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.add(UserRole(user_id=user.id, role_id=role.id))
            db.commit()
    finally:
        db.close()

    res = client.post("/api/v1/auth/login", json={"identifier": email, "password": "AdminPass123!"})
    return res.json()["access_token"]


def test_non_admin_blocked_from_admin_endpoints(client: TestClient):
    citizen_token = get_token(client, "regular_citizen@example.com", "COMMUNITY")
    officer_token = get_token(client, "field_officer_block@example.com", "OFFICER")
    auth_token = get_token(client, "authority_user_block@example.com", "AUTHORITY")

    for t in [citizen_token, officer_token, auth_token]:
        res = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {t}"})
        assert res.status_code == 403


def test_super_admin_stats(client: TestClient):
    admin_token = get_token(client, "super_admin_stats@example.com", "SUPER_ADMIN", "Chief Admin")
    res = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "total_complaints" in data
    assert "total_departments" in data
    assert "active_alerts" in data
    assert "total_audit_logs" in data
    assert data["total_users"] >= 1


def test_super_admin_list_and_manage_users(client: TestClient):
    admin_token = get_token(client, "super_admin_users@example.com", "SUPER_ADMIN", "Chief Admin")
    citizen_token = get_token(client, "target_citizen_user@example.com", "COMMUNITY", "Target User")

    # 1. List users
    res = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 2
    target = next(u for u in users if u["email"] == "target_citizen_user@example.com")
    target_id = target["id"]
    assert target["role"] == "COMMUNITY"

    # 2. Promote target citizen to AUTHORITY
    role_res = client.patch(
        f"/api/v1/admin/users/{target_id}/role",
        json={"role": "AUTHORITY"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert role_res.status_code == 200
    assert role_res.json()["role"] == "AUTHORITY"

    # 3. Deactivate user
    deact_res = client.patch(
        f"/api/v1/admin/users/{target_id}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert deact_res.status_code == 200
    assert deact_res.json()["is_active"] is False

    # 4. Reactivate user
    react_res = client.patch(
        f"/api/v1/admin/users/{target_id}/status",
        json={"is_active": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert react_res.status_code == 200
    assert react_res.json()["is_active"] is True


def test_super_admin_department_creation_and_listing(client: TestClient):
    admin_token = get_token(client, "super_admin_dept@example.com", "SUPER_ADMIN", "Chief Admin")

    dept_code = f"TEST_DEPT_{uuid.uuid4().hex[:4].upper()}"
    payload = {
        "code": dept_code,
        "name_ml": "പരിസ്ഥിതി സംരക്ഷണ വിഭാഗം",
        "name_en": "Environmental Conservation Wing",
        "contact_email": "eco@kerala.gov.in",
        "contact_phone": "+914712334455",
    }
    create_res = client.post(
        "/api/v1/admin/departments",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert create_res.status_code == 201
    assert create_res.json()["code"] == dept_code

    # List departments
    list_res = client.get("/api/v1/admin/departments", headers={"Authorization": f"Bearer {admin_token}"})
    assert list_res.status_code == 200
    depts = list_res.json()
    assert any(d["code"] == dept_code for d in depts)


def test_super_admin_view_audit_logs(client: TestClient):
    admin_token = get_token(client, "super_admin_audit@example.com", "SUPER_ADMIN", "Chief Admin")
    res = client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1
    # Verify audit actions exist from previous role changes/status toggles
    actions = [l["action"] for l in logs]
    assert any("ADMIN_" in a for a in actions)
