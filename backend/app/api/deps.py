from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import get_db_optional

COOKIE_NAME = "modu_session"

# DATABASE_URL이 없을 때만 쓰는 임시 데모 로그인(admin/1234, app/api/routes/auth.py)의 고정 사용자 id.
# DB가 연결되면 실제 유저 id는 항상 양수(PK)이므로 절대 충돌하지 않는다.
DEMO_USER_ID = -1


def get_demo_user() -> User:
    return User(
        id=DEMO_USER_ID,
        email="admin",
        hashed_password="",
        created_at=datetime.now(timezone.utc),
    )


async def _resolve_user(token: str | None, db: AsyncSession | None) -> User | None:
    if not token:
        return None
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    if user_id == DEMO_USER_ID:
        return get_demo_user()
    if db is None:
        return None
    return await db.get(User, user_id)


async def get_current_user(
    modu_session: str | None = Cookie(default=None),
    db: AsyncSession | None = Depends(get_db_optional),
) -> User:
    user = await _resolve_user(modu_session, db)
    if user is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return user


async def get_current_user_optional(
    modu_session: str | None = Cookie(default=None),
    db: AsyncSession | None = Depends(get_db_optional),
) -> User | None:
    return await _resolve_user(modu_session, db)
