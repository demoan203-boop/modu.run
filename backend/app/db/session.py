from collections.abc import AsyncGenerator

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

_engine: AsyncEngine | None = None
_session_maker: async_sessionmaker[AsyncSession] | None = None

if settings.database_url:
    _engine = create_async_engine(settings.database_url)
    _session_maker = async_sessionmaker(_engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if _session_maker is None:
        raise HTTPException(status_code=503, detail="DATABASE_URL이 설정되지 않았습니다.")
    async with _session_maker() as session:
        yield session


async def get_db_optional() -> AsyncGenerator[AsyncSession | None, None]:
    """DB가 설정되지 않았으면 None을 반환한다. 검색 기록 저장처럼 DB가 필수는 아닌 경로에서 사용."""
    if _session_maker is None:
        yield None
        return
    async with _session_maker() as session:
        yield session


async def create_tables() -> None:
    """앱 시작 시 테이블을 생성한다. DATABASE_URL이 없으면 아무 것도 하지 않는다."""
    if _engine is None:
        return
    from app.db.models import Base

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
