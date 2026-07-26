from unittest.mock import AsyncMock, patch

from app.services.ai_query_parser import AIQueryParseResult


def test_register_and_me(client):
    response = client.post("/api/auth/register", json={"email": "a@example.com", "password": "password123"})
    assert response.status_code == 201
    assert response.json()["email"] == "a@example.com"

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"


def test_register_duplicate_email_returns_409(client):
    client.post("/api/auth/register", json={"email": "dup@example.com", "password": "password123"})
    response = client.post("/api/auth/register", json={"email": "dup@example.com", "password": "password123"})
    assert response.status_code == 409


def test_login_wrong_password_returns_401(client):
    client.post("/api/auth/register", json={"email": "b@example.com", "password": "password123"})
    response = client.post("/api/auth/login", json={"email": "b@example.com", "password": "wrong-password"})
    assert response.status_code == 401


def test_me_without_login_returns_401(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_logout_clears_session(client):
    client.post("/api/auth/register", json={"email": "c@example.com", "password": "password123"})
    assert client.get("/api/auth/me").status_code == 200

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 204
    assert client.get("/api/auth/me").status_code == 401


def test_login_with_remember_true_sets_persistent_cookie(client):
    client.post("/api/auth/register", json={"email": "remember1@example.com", "password": "password123"})
    client.post("/api/auth/logout")

    response = client.post(
        "/api/auth/login",
        json={"email": "remember1@example.com", "password": "password123", "remember": True},
    )
    assert response.status_code == 200
    assert "max-age" in response.headers["set-cookie"].lower()


def test_login_with_remember_false_sets_session_cookie(client):
    client.post("/api/auth/register", json={"email": "remember2@example.com", "password": "password123"})
    client.post("/api/auth/logout")

    response = client.post(
        "/api/auth/login",
        json={"email": "remember2@example.com", "password": "password123", "remember": False},
    )
    assert response.status_code == 200
    assert "max-age" not in response.headers["set-cookie"].lower()

    # 세션 쿠키라도 로그인 자체는 정상적으로 유지된다 (같은 요청/응답 사이클 안에서는 쿠키가 살아있음).
    assert client.get("/api/auth/me").status_code == 200


def test_search_saves_history_for_logged_in_user(client):
    client.post("/api/auth/register", json={"email": "d@example.com", "password": "password123"})

    with patch(
        "app.api.routes.search.ai_query_parser.parse_query",
        return_value=AIQueryParseResult(keywords="무선 이어폰", max_price=None, summary="요약"),
    ), patch(
        "app.api.routes.search.search_products",
        new=AsyncMock(return_value=[]),
    ):
        search_response = client.post("/api/search", json={"query": "무선 이어폰"})
    assert search_response.status_code == 200

    history = client.get("/api/search/history")
    assert history.status_code == 200
    data = history.json()
    assert len(data) == 1
    assert data[0]["query"] == "무선 이어폰"
    assert data[0]["ai_summary"] == "요약"
