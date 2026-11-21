import uuid
import pytest
from fastapi.testclient import TestClient
from tests.conftest import TestingSessionLocal
from app.models.auth import User, Role, UserRole
from app.core.security import get_password_hash


def test_bilingual_registration_and_preference(client: TestClient):
    suffix = uuid.uuid4().hex[:6]
    email = f"bilingual_{suffix}@example.com"
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Bilingual Citizen",
            "email": email,
            "phone": f"+9198{suffix[:8]}",
            "password": "Password123!",
            "preferred_language": "ml",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["preferred_language"] == "ml"
    token = data["access_token"]

    # Test update language preference to English
    patch_res = client.patch(
        "/api/v1/auth/me/language",
        headers={"Authorization": f"Bearer {token}"},
        json={"preferred_language": "en"},
    )
    assert patch_res.status_code == 200
    updated_user = patch_res.json()
    assert updated_user["preferred_language"] == "en"

    # Test get me confirms updated language
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["preferred_language"] == "en"


def test_bilingual_error_responses(client: TestClient):
    # Test 404 error response
    res = client.get("/api/v1/non_existent_route_404")
    assert res.status_code == 404
    data = res.json()
    assert "detail" in data
    assert "detail_ml" in data
    assert "detail_en" in data
    assert "കണ്ടെത്താനായില്ല" in data["detail_ml"]
