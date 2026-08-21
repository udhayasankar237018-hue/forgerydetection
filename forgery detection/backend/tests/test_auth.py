import os
import sys
# pyrefly: ignore [missing-import]
import pytest
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient

# Ensure app path in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import init_db

client = TestClient(app)


def setup_module():
    init_db()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"


def test_register_and_login():
    email = "test_analyst@forgeryguard.ai"
    password = "TestPassword@123"

    # Register
    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Test Analyst", "email": email, "password": password}
    )
    assert reg_res.status_code in [200, 201, 400]  # 400 if already exists

    # Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": password}
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    token = token_data["access_token"]

    # Verify Profile
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == email
