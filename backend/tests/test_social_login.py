from unittest.mock import AsyncMock, MagicMock, patch


def _fake_kakao_response(email: str | None, kakao_id: int = 111):
    response = MagicMock()
    response.raise_for_status = MagicMock()
    response.json = MagicMock(
        return_value={
            "id": kakao_id,
            "kakao_account": ({"email": email} if email else {}),
        }
    )
    return response


def test_google_login_creates_new_user(client):
    claims = {"sub": "google-123", "email": "googleuser@example.com", "email_verified": True}
    with patch("app.api.routes.auth.google_id_token.verify_oauth2_token", return_value=claims):
        response = client.post("/api/auth/google", json={"id_token": "fake-token"})

    assert response.status_code == 200
    assert response.json()["email"] == "googleuser@example.com"

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "googleuser@example.com"


def test_google_login_links_existing_email_account(client):
    client.post("/api/auth/register", json={"email": "linked@example.com", "password": "password123"})
    client.post("/api/auth/logout")

    claims = {"sub": "google-456", "email": "linked@example.com", "email_verified": True}
    with patch("app.api.routes.auth.google_id_token.verify_oauth2_token", return_value=claims):
        response = client.post("/api/auth/google", json={"id_token": "fake-token"})

    assert response.status_code == 200
    assert response.json()["email"] == "linked@example.com"


def test_google_login_rejects_unverified_email(client):
    claims = {"sub": "google-789", "email": "unverified@example.com", "email_verified": False}
    with patch("app.api.routes.auth.google_id_token.verify_oauth2_token", return_value=claims):
        response = client.post("/api/auth/google", json={"id_token": "fake-token"})

    assert response.status_code == 401


def test_kakao_login_creates_new_user(client):
    fake_response = _fake_kakao_response(email="kakaouser@example.com")
    with patch("app.api.routes.auth.httpx.AsyncClient") as mock_client_cls:
        mock_client_cls.return_value.__aenter__ = AsyncMock(return_value=mock_client_cls.return_value)
        mock_client_cls.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value.get = AsyncMock(return_value=fake_response)

        response = client.post("/api/auth/kakao", json={"access_token": "fake-kakao-token"})

    assert response.status_code == 200
    assert response.json()["email"] == "kakaouser@example.com"


def test_kakao_login_without_email_scope_returns_400(client):
    fake_response = _fake_kakao_response(email=None)
    with patch("app.api.routes.auth.httpx.AsyncClient") as mock_client_cls:
        mock_client_cls.return_value.__aenter__ = AsyncMock(return_value=mock_client_cls.return_value)
        mock_client_cls.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value.get = AsyncMock(return_value=fake_response)

        response = client.post("/api/auth/kakao", json={"access_token": "fake-kakao-token"})

    assert response.status_code == 400
