import uuid

from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.models.auth import Role, User, UserRole
from tests.conftest import TestingSessionLocal


def get_citizen_token(client: TestClient) -> str:
    db = TestingSessionLocal()
    suffix = uuid.uuid4().hex[:6]
    email = f"citizen_sec_{suffix}@example.com"
    try:
        role = db.query(Role).filter_by(name="COMMUNITY").first()
        if not role:
            role = Role(name="COMMUNITY", display_name_ml="പൗരൻ", display_name_en="Citizen")
            db.add(role)
            db.commit()

        user = User(
            id=uuid.uuid4(),
            full_name="Security Citizen",
            email=email,
            phone=f"+9198{suffix[:8]}",
            password_hash=get_password_hash("PassSec123!"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()
    finally:
        db.close()

    res = client.post("/api/v1/auth/login", json={"identifier": email, "password": "PassSec123!"})
    return res.json()["access_token"]


def test_security_headers_present_on_all_responses(client: TestClient):
    """Verify standard OWASP security headers on API responses."""
    res = client.get("/health")
    assert res.status_code == 200
    headers = res.headers

    assert headers.get("x-content-type-options") == "nosniff"
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("x-xss-protection") == "1; mode=block"
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in headers.get("content-security-policy", "")


def test_sql_injection_resistance_on_login(client: TestClient):
    """Verify parameterized queries block classic SQL injection authentication bypass."""
    sqli_payloads = [
        "' OR '1'='1",
        "admin' --",
        "' OR 1=1 --",
        '" or ""="',
        "'; DROP TABLE users; --",
    ]
    for payload in sqli_payloads:
        res = client.post(
            "/api/v1/auth/login", json={"identifier": payload, "password": "password"}
        )
        assert res.status_code == 401
        assert "തെറ്റായ ഇമെയിൽ" in res.json()["detail"] or "Invalid" in res.json()["detail"]


def test_sql_injection_resistance_on_map_query(client: TestClient):
    """Verify parameterized queries prevent SQL injection in map queries."""
    res = client.get("/api/v1/map/clusters?category=WASTE' OR 1=1 --")
    # Category should be sanitized or return filtered/empty, never 500 error
    assert res.status_code == 200


def test_xss_sanitization_on_complaint_submission(client: TestClient):
    """Verify malicious script and HTML tags are sanitized before persistence."""
    citizen_token = get_citizen_token(client)
    xss_payload = {
        "title": "<script>alert('XSS_ATTACK')</script>Illegal Waste Dumping",
        "description": "<iframe src='javascript:alert(1)'></iframe>Contaminated drainage with chemicals",
        "category": "WASTE",
        "severity": "HIGH",
        "location": {
            "latitude": 9.9312,
            "longitude": 76.2673,
            "district": "Ernakulam",
            "lsgd_type": "CORPORATION",
            "lsgd_name": "Kochi Corporation",
        },
    }

    res = client.post(
        "/api/v1/complaints",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json=xss_payload,
    )
    assert res.status_code == 201
    created = res.json()
    # Script and iframe tags must be neutralized
    assert "<script>" not in created["title"]
    assert "<iframe>" not in created["description"]
    assert "Illegal Waste Dumping" in created["title"]


def test_unauthorized_idor_and_privilege_escalation_blocked(client: TestClient):
    """Verify citizens are strictly blocked from admin, assignment, and triage endpoints."""
    citizen_token = get_citizen_token(client)
    auth_header = {"Authorization": f"Bearer {citizen_token}"}

    # Citizen trying to access Super Admin users
    res = client.get("/api/v1/admin/users", headers=auth_header)
    assert res.status_code == 403

    # Citizen trying to access Super Admin audit logs
    res = client.get("/api/v1/admin/audit-logs", headers=auth_header)
    assert res.status_code == 403

    # Citizen trying to assign an officer
    fake_id = uuid.uuid4()
    res = client.post(
        f"/api/v1/complaints/{fake_id}/assign",
        headers=auth_header,
        json={"assigned_to_id": str(uuid.uuid4())},
    )
    assert res.status_code == 403

    # Citizen trying to broadcast emergency alert
    res = client.post(
        "/api/v1/alerts",
        headers=auth_header,
        json={
            "title_ml": "വ്യാജ മുന്നറിയിപ്പ്",
            "title_en": "Fake Alert",
            "message_ml": "ടെസ്റ്റ്",
            "message_en": "Test",
        },
    )
    assert res.status_code == 403


def test_rate_limiting_exceeded_handler():
    """Verify rate limit exceeded error formatting."""
    from slowapi.errors import RateLimitExceeded
    from starlette.requests import Request

    from app.core.limiter import custom_rate_limit_exceeded_handler

    class MockRateLimitExceeded(RateLimitExceeded):
        def __init__(self, detail_msg: str):
            self.status_code = 429
            self.detail = detail_msg

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/auth/login",
        "headers": [],
    }
    req = Request(scope)
    exc = MockRateLimitExceeded("5 per 1 minute")
    response = custom_rate_limit_exceeded_handler(req, exc)

    assert response.status_code == 429
    assert response.headers["Retry-After"] == "60"
    import json

    data = json.loads(response.body.decode("utf-8"))
    assert "detail_ml" in data
    assert "detail_en" in data
