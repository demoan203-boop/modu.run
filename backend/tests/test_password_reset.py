from sqlalchemy import select

from app.db.models import User


async def _get_reset_token(db_session_maker, email: str) -> str:
    async with db_session_maker() as session:
        user = await session.scalar(select(User).where(User.email == email))
        assert user.reset_token is not None
        return user.reset_token


def test_forgot_password_existing_and_missing_email_both_return_generic_message(client):
    client.post("/api/auth/register", json={"email": "reset@example.com", "password": "password123"})

    existing = client.post("/api/auth/forgot-password", json={"email": "reset@example.com"})
    missing = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})

    assert existing.status_code == 200
    assert missing.status_code == 200
    assert existing.json() == missing.json()


def test_reset_password_with_valid_token_changes_password(client, db_session_maker):
    import asyncio

    client.post("/api/auth/register", json={"email": "reset2@example.com", "password": "oldpassword1"})
    client.post("/api/auth/forgot-password", json={"email": "reset2@example.com"})

    token = asyncio.run(_get_reset_token(db_session_maker, "reset2@example.com"))

    reset = client.post("/api/auth/reset-password", json={"token": token, "new_password": "newpassword1"})
    assert reset.status_code == 200

    old_login = client.post(
        "/api/auth/login", json={"email": "reset2@example.com", "password": "oldpassword1"}
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/auth/login", json={"email": "reset2@example.com", "password": "newpassword1"}
    )
    assert new_login.status_code == 200


def test_reset_password_with_invalid_token_returns_400(client):
    response = client.post(
        "/api/auth/reset-password", json={"token": "not-a-real-token", "new_password": "whatever123"}
    )
    assert response.status_code == 400
