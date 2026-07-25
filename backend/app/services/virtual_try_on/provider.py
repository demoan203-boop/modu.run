from abc import ABC, abstractmethod

from .types import VirtualTryOnInput, VirtualTryOnResult


class VirtualTryOnProvider(ABC):
    @abstractmethod
    async def create_job(self, job_id: str, input: VirtualTryOnInput) -> VirtualTryOnResult: ...

    @abstractmethod
    async def get_job(self, job_id: str) -> VirtualTryOnResult: ...


def get_provider() -> VirtualTryOnProvider:
    """실제 요청이 들어왔을 때만 호출한다 - 모듈 임포트 시점에 환경변수를 읽지 않으므로
    키가 없어도 애플리케이션 임포트/빌드가 실패하지 않는다."""
    from app.core.config import settings

    if settings.virtual_try_on_provider == "external":
        from .external_provider import ExternalProvider

        return ExternalProvider()

    from .mock_provider import MockProvider

    return MockProvider()
