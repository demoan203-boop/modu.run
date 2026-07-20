from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import COOKIE_NAME, get_current_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import User
from app.models.schemas import UserCreate, UserLogin, UserOut

router = APIRouter()


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


@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다.")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    response.set_cookie(
        COOKIE_NAME, token, max_age=settings.jwt_expire_minutes * 60, **_cookie_kwargs()
    )
    return user


@router.post("/login", response_model=UserOut)
async def login(payload: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    token = create_access_token(user.id)
    response.set_cookie(
        COOKIE_NAME, token, max_age=settings.jwt_expire_minutes * 60, **_cookie_kwargs()
    )
    return user


@router.post("/logout", status_code=204)
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/", domain=settings.cookie_domain)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
