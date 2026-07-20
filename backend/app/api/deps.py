from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import get_db, get_db_optional

COOKIE_NAME = "modu_session"


async def _resolve_user(token: str | None, db: AsyncSession | None) -> User | None:
    if not token or db is None:
        return None
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return await db.get(User, user_id)


async def get_current_user(
    modu_session: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
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
