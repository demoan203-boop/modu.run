import httpx

from .provider import VirtualTryOnProvider
from .types import VirtualTryOnInput, VirtualTryOnResult

_REQUEST_TIMEOUT_SECONDS = 20.0
_ALLOWED_RESULT_SCHEMES = ("https://", "http://")


class ExternalProviderNotConfiguredError(Exception):
    pass


class ExternalProvider(VirtualTryOnProvider):
    """실제 외부 AI 가상 착용 API 연동 지점.

    VIRTUAL_TRY_ON_API_URL / VIRTUAL_TRY_ON_API_KEY를 설정하면 이 클래스가 선택된다
    (VIRTUAL_TRY_ON_PROVIDER=external). 실제 서비스의 요청/응답 스펙에 맞춰
    아래 페이로드와 파싱 부분만 수정하면 된다.
    """

    def __init__(self) -> None:
        from app.core.config import settings

        if not settings.virtual_try_on_api_url or not settings.virtual_try_on_api_key:
            raise ExternalProviderNotConfiguredError(
                "VIRTUAL_TRY_ON_API_URL / VIRTUAL_TRY_ON_API_KEY가 설정되지 않았습니다."
            )
        self._api_url = settings.virtual_try_on_api_url
        self._api_key = settings.virtual_try_on_api_key

    async def create_job(self, job_id: str, input: VirtualTryOnInput) -> VirtualTryOnResult:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT_SECONDS) as client:
            try:
                response = await client.post(
                    f"{self._api_url}/jobs",
                    headers={"Authorization": f"Bearer {self._api_key}"},
                    data={
                        "product_id": input.product_id,
                        "product_image_url": input.product_image_url,
                        "category": input.category,
                        "color": input.color or "",
                        "size": input.size or "",
                        "client_job_id": job_id,
                    },
                    files={"person_image": ("person.jpg", input.person_image_bytes, "image/jpeg")},
                )
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError):
                # 공급자 원문 에러를 사용자에게 그대로 노출하지 않는다 (서버 로그는 호출부에서 별도 기록).
                return VirtualTryOnResult(
                    job_id=job_id, status="failed", error="AI 가상 착용 요청에 실패했습니다."
                )

        provider_job_id = payload.get("job_id")
        if not provider_job_id:
            return VirtualTryOnResult(job_id=job_id, status="failed", error="AI 가상 착용 요청에 실패했습니다.")

        return VirtualTryOnResult(job_id=provider_job_id, status="queued")

    async def get_job(self, job_id: str) -> VirtualTryOnResult:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT_SECONDS) as client:
            try:
                response = await client.get(
                    f"{self._api_url}/jobs/{job_id}",
                    headers={"Authorization": f"Bearer {self._api_key}"},
                )
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError):
                return VirtualTryOnResult(
                    job_id=job_id, status="failed", error="처리 상태를 확인하지 못했습니다."
                )

        status = payload.get("status")
        if status not in ("queued", "processing", "succeeded", "failed"):
            return VirtualTryOnResult(job_id=job_id, status="failed", error="알 수 없는 처리 상태입니다.")

        result_url = payload.get("result_image_url")
        if status == "succeeded":
            if not result_url or not result_url.startswith(_ALLOWED_RESULT_SCHEMES):
                return VirtualTryOnResult(
                    job_id=job_id, status="failed", error="결과 이미지 주소가 올바르지 않습니다."
                )

        return VirtualTryOnResult(job_id=job_id, status=status, result_image_url=result_url)
