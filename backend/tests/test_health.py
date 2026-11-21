import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NAAM" in data["service"]
    assert data["service_ml"] == "നാം കേന്ദ്രീകൃത പ്ലാറ്റ്‌ഫോം"


def test_v1_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "api_version": "v1"}
