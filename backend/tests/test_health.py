from fastapi.testclient import TestClient

from api.main import app


def test_health_returns_ok() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "portfolio-api"}


def test_root_returns_service_metadata() -> None:
    response = TestClient(app).get("/")

    assert response.status_code == 200
    assert response.json() == {"service": "portfolio-api"}
