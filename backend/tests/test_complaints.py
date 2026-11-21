import pytest


def get_auth_token(client, email="citizen.test@example.com"):
    # Generate unique phone suffix
    suffix = str(abs(hash(email)))[:8]
    reg_payload = {
        "full_name": "ടെസ്റ്റ് പൗരൻ",
        "email": email,
        "phone": f"+9198{suffix}",
        "password": "Password123!",
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Login to obtain token
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": "Password123!"},
    )
    return login_res.json()["access_token"]


def test_create_complaint_success(client):
    token = get_auth_token(client, "kochi.citizen@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "title": "കൊച്ചി കായലിൽ പ്ലാസ്റ്റിക് മാലിന്യ നിക്ഷേപം",
        "description": "മറൈൻ ഡ്രൈവിന് സമീപം വൻതോതിൽ പ്ലാസ്റ്റിക് കുപ്പികളും മാലിന്യങ്ങളും അടിഞ്ഞുകൂടിയിരിക്കുന്നു.",
        "category": "WASTE",
        "severity": "HIGH",
        "location": {
            "latitude": 9.9816,
            "longitude": 76.2999,
            "district": "Ernakulam",
            "lsgd_type": "CORPORATION",
            "lsgd_name": "Kochi Municipal Corporation",
            "ward_number": "62",
            "landmark": "Marine Drive Walkway",
        },
        "evidence": [
            {
                "file_url": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5",
                "file_type": "image/jpeg",
                "file_size_bytes": 1048576,
                "evidence_type": "CITIZEN_SUBMISSION",
            }
        ],
    }

    response = client.post("/api/v1/complaints", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()

    assert data["tracking_code"].startswith("NAAM-2026-")
    assert data["title"] == "കൊച്ചി കായലിൽ പ്ലാസ്റ്റിക് മാലിന്യ നിക്ഷേപം"
    assert data["category"] == "WASTE"
    assert data["category_display_ml"] == "മാലിന്യ നിക്ഷേപം"
    assert data["current_status"] == "SUBMITTED"
    assert data["status_display_ml"] == "സമർപ്പിച്ചു"
    assert data["location"]["district"] == "Ernakulam"
    assert len(data["evidence"]) == 1
    assert len(data["updates"]) == 1

    # Test tracking by code
    tracking_code = data["tracking_code"]
    track_res = client.get(f"/api/v1/complaints/track/{tracking_code}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["tracking_code"] == tracking_code
    assert track_data["current_status"] == "SUBMITTED"


def test_create_complaint_outside_kerala_bounds(client):
    token = get_auth_token(client, "delhi.attempt@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Delhi coordinates (Latitude 28.6139, Longitude 77.2090)
    payload = {
        "title": "ഡൽഹിയിലെ പ്രശ്നം",
        "description": "കേരളത്തിന് പുറത്തുള്ള അസാധുവായ ലൊക്കേഷൻ ടെസ്റ്റ്.",
        "category": "WASTE",
        "location": {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "district": "Central Delhi",
            "lsgd_type": "MUNICIPALITY",
            "lsgd_name": "NDMC",
        },
    }

    response = client.post("/api/v1/complaints", json=payload, headers=headers)
    assert response.status_code == 422
    assert "കേരളത്തിനകത്തുള്ള" in response.text


def test_get_my_complaints(client):
    token = get_auth_token(client, "tvm.reporter@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Submit complaint
    payload = {
        "title": "കരമനയാറ്റിൽ മലിനജലം ഒഴുക്കുന്നു",
        "description": "തൊട്ടടുത്ത സ്ഥാപനത്തിൽ നിന്നും സംസ്കരിക്കാത്ത മലിനജലം ആറ്റിലേക്ക് തുറന്നുവിടുന്നു.",
        "category": "WATER_POLLUTION",
        "location": {
            "latitude": 8.5241,
            "longitude": 76.9366,
            "district": "Thiruvananthapuram",
            "lsgd_type": "CORPORATION",
            "lsgd_name": "Thiruvananthapuram Corporation",
        },
    }
    client.post("/api/v1/complaints", json=payload, headers=headers)

    # Fetch user's complaints
    res = client.get("/api/v1/complaints/me", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert items[0]["title"] == "കരമനയാറ്റിൽ മലിനജലം ഒഴുക്കുന്നു"
    assert items[0]["category_display_ml"] == "ജല മലിനീകരണം"


def test_track_complaint_not_found(client):
    res = client.get("/api/v1/complaints/track/NAAM-2026-99999")
    assert res.status_code == 404
    assert "പരാതി കണ്ടെത്തിയില്ല" in res.json()["detail"]
