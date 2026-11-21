def test_register_citizen_success(client):
    payload = {
        "full_name": "Anjali Nair",
        "email": "anjali.nair@example.com",
        "phone": "+919876543210",
        "password": "StrongPassword123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["full_name"] == "Anjali Nair"
    assert data["user"]["role"] == "COMMUNITY"
    assert data["user"]["role_display_ml"] == "പൗരൻ"


def test_register_duplicate_email_fails(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "anjali.nair@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്" in response.json()["detail"]


def test_login_success(client):
    payload = {
        "identifier": "anjali.nair@example.com",
        "password": "StrongPassword123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "anjali.nair@example.com"


def test_login_invalid_password(client):
    payload = {
        "identifier": "anjali.nair@example.com",
        "password": "WrongPassword!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "തെറ്റായ ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ്" in response.json()["detail"]


def test_role_mismatch_portal_block(client):
    # Citizen trying to log into the Authority Portal
    payload = {
        "identifier": "anjali.nair@example.com",
        "password": "StrongPassword123!",
        "expected_role": "AUTHORITY",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 403
    assert "അനുമതിയില്ല" in response.json()["detail"]


def test_get_current_user_me(client):
    # First login to get token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "identifier": "anjali.nair@example.com",
            "password": "StrongPassword123!",
        },
    )
    token = login_resp.json()["access_token"]

    # Call /me with valid Bearer token
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "anjali.nair@example.com"
    assert profile["role"] == "COMMUNITY"


def test_refresh_token_rotation(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "identifier": "anjali.nair@example.com",
            "password": "StrongPassword123!",
        },
    )
    refresh_token = login_resp.json()["refresh_token"]

    refresh_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()
