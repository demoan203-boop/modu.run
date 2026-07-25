import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import COOKIE_NAME, get_current_user, get_demo_user
from app.db.session import get_db, get_db_optional
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import User
from app.models.schemas import (
    ForgotPasswordRequest,
    GoogleLoginRequest,
    KakaoLoginRequest,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    UserOut,
)

router = APIRouter()

RESET_TOKEN_EXPIRE_MINUTES = 30


def _cookie_kwargs() -> dict:
    kwargs = {
        "httponly": True,
        "samesite": "lax",
        "secure": settings.cookie_secure,
        "path": "/",
    }
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    return kwargs


def _issue_session(user: User, response: Response) -> None:
    if not settings.jwt_secret_key:
        raise HTTPException(status_code=503, detail="JWT_SECRET_KEY이 설정되지 않았습니다.")
    token = create_access_token(user.id)
    response.set_cookie(COOKIE_NAME, token, max_age=settings.jwt_expire_minutes * 60, **_cookie_kwargs())


async def _find_or_link_social_user(
    db: AsyncSession, *, provider_column, provider_id: str, email: str
) -> User:
    user = await db.scalar(select(User).where(provider_column == provider_id))
    if user is not None:
        return user

    user = await db.scalar(select(User).where(User.email == email))
    if user is not None:
        setattr(user, provider_column.key, provider_id)
        await db.commit()
        await db.refresh(user)
        return user

    user = User(
        email=email,
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        **{provider_column.key: provider_id},
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다.")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    _issue_session(user, response)
    return user


@router.post("/login", response_model=UserOut)
async def login(payload: UserLogin, response: Response, db: AsyncSession | None = Depends(get_db_optional)):
    if db is None:
        # DATABASE_URL 미설정 상태에서만 동작하는 임시 데모 로그인.
        # DB가 연결되는 즉시 이 분기 자체가 실행되지 않으므로 자동으로 비활성화된다.
        if payload.email == "admin" and payload.password == "1234":
            user = get_demo_user()
            _issue_session(user, response)
            return user
        raise HTTPException(status_code=503, detail="DATABASE_URL이 설정되지 않았습니다.")

    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    _issue_session(user, response)
    return user


@router.post("/logout", status_code=204)
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/", domain=settings.cookie_domain)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is not None:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=RESET_TOKEN_EXPIRE_MINUTES
        )
        await db.commit()
        # TODO: 이메일 발송 서비스 연동 전까지는 로그로만 확인 (API 응답에는 절대 노출하지 않음)
        print(f"[비밀번호 재설정 링크] https://modu.run/?resetToken={token}")

    return {"message": "입력하신 이메일로 재설정 링크를 보냈어요."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.reset_token == payload.token))
    expires_at = user.reset_token_expires_at if user else None
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if user is None or expires_at is None or expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="유효하지 않거나 만료된 링크입니다.")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    await db.commit()
    return {"message": "비밀번호가 변경되었습니다."}


@router.post("/google", response_model=UserOut)
async def google_login(payload: GoogleLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        claims = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.google_client_id
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="구글 로그인 검증에 실패했습니다.") from exc

    if not claims.get("email_verified"):
        raise HTTPException(status_code=401, detail="이메일 인증이 완료된 구글 계정만 사용할 수 있습니다.")

    user = await _find_or_link_social_user(
        db, provider_column=User.google_id, provider_id=claims["sub"], email=claims["email"]
    )
    _issue_session(user, response)
    return user


@router.post("/kakao", response_model=UserOut)
async def kakao_login(payload: KakaoLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            kakao_response = await client.get(
                "https://kapi.kakao.com/v2/user/me",
                headers={"Authorization": f"Bearer {payload.access_token}"},
            )
            kakao_response.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=401, detail="카카오 로그인 검증에 실패했습니다.") from exc

    kakao_user = kakao_response.json()
    email = kakao_user.get("kakao_account", {}).get("email")
    if not email:
        raise HTTPException(
            status_code=400, detail="카카오 계정에 이메일 제공 동의가 필요합니다."
        )

    user = await _find_or_link_social_user(
        db, provider_column=User.kakao_id, provider_id=str(kakao_user["id"]), email=email
    )
    _issue_session(user, response)
    return user
