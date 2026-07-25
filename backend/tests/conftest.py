import asyncio
from collections.abc import AsyncGenerator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db.session import get_db, get_db_optional
from app.db.models import Base
from app.main import app


async def _create_tables(engine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@pytest.fixture()
def db_session_maker():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    asyncio.run(_create_tables(engine))
    maker = async_sessionmaker(engine, expire_on_commit=False)
    yield maker
    asyncio.run(engine.dispose())


@pytest.fixture()
def client(db_session_maker) -> TestClient:
    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with db_session_maker() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_db_optional] = _override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def demo_client() -> TestClient:
    """DATABASE_URL이 없는 상태를 재현 - get_db_optional이 None을 반환한다."""
    from app.core import memory_store

    async def _override_get_db_optional() -> AsyncGenerator[None, None]:
        yield None

    app.dependency_overrides[get_db_optional] = _override_get_db_optional
    memory_store.reset()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    memory_store.reset()
