import base64
import io
import time
from collections import OrderedDict

import httpx
from PIL import Image, ImageDraw

from .provider import VirtualTryOnProvider
from .types import VirtualTryOnInput, VirtualTryOnResult

# 실제 AI 호출이 아닌 데모용 합성 미리보기 - 사람 사진은 여기서만 잠깐(요청 처리 중) 메모리에 올라갔다가
# 조회가 끝나면 버려진다. 디스크/DB에는 이미지 바이트를 전혀 기록하지 않는다.
_MAX_CACHE_ENTRIES = 200
_PROCESSING_AFTER_SECONDS = 1.0
_SUCCEEDED_AFTER_SECONDS = 2.5

_job_cache: "OrderedDict[str, dict]" = OrderedDict()


def _remember(job_id: str, *, result_bytes: bytes | None, error: str | None) -> None:
    _job_cache[job_id] = {
        "created_at": time.time(),
        "result_bytes": result_bytes,
        "error": error,
    }
    _job_cache.move_to_end(job_id)
    while len(_job_cache) > _MAX_CACHE_ENTRIES:
        _job_cache.popitem(last=False)


def _fetch_product_thumbnail(product_image_url: str) -> Image.Image | None:
    if not product_image_url.startswith(("http://", "https://")):
        return None
    try:
        response = httpx.get(product_image_url, timeout=5.0, follow_redirects=True)
        response.raise_for_status()
        if not response.headers.get("content-type", "").startswith("image/"):
            return None
        return Image.open(io.BytesIO(response.content)).convert("RGBA")
    except (httpx.HTTPError, OSError):
        return None


def _composite_demo_image(person_image_bytes: bytes, product_image_url: str) -> bytes:
    person = Image.open(io.BytesIO(person_image_bytes)).convert("RGB")
    person.thumbnail((900, 1200))

    canvas = person.convert("RGBA")

    product = _fetch_product_thumbnail(product_image_url)
    if product is not None:
        thumb_size = min(220, canvas.width // 3)
        product.thumbnail((thumb_size, thumb_size))
        pad = 12
        badge_w, badge_h = product.width + pad * 2, product.height + pad * 2
        x = canvas.width - badge_w - 16
        y = canvas.height - badge_h - 16
        badge = Image.new("RGBA", (badge_w, badge_h), (255, 255, 255, 235))
        badge.paste(product, (pad, pad), product)
        canvas.alpha_composite(badge, (x, y))

    # PIL 기본 폰트는 한글 글리프를 지원하지 않으므로(두부 글자 방지) 워터마크는 영문만 사용한다.
    # 실제 "Demo Preview" 안내는 프런트 UI 배지가 담당한다.
    draw = ImageDraw.Draw(canvas, "RGBA")
    banner_h = 32
    draw.rectangle([(0, 0), (canvas.width, banner_h)], fill=(0, 0, 0, 140))
    draw.text((12, 8), "DEMO PREVIEW - AI Virtual Try-On (mock)", fill=(255, 255, 255, 255))

    buffer = io.BytesIO()
    canvas.convert("RGB").save(buffer, format="JPEG", quality=85)
    return buffer.getvalue()


class MockProvider(VirtualTryOnProvider):
    async def create_job(self, job_id: str, input: VirtualTryOnInput) -> VirtualTryOnResult:
        try:
            result_bytes = _composite_demo_image(input.person_image_bytes, input.product_image_url)
            _remember(job_id, result_bytes=result_bytes, error=None)
        except Exception:
            _remember(job_id, result_bytes=None, error="이미지를 처리하지 못했습니다.")
        return VirtualTryOnResult(job_id=job_id, status="queued")

    async def get_job(self, job_id: str) -> VirtualTryOnResult:
        entry = _job_cache.get(job_id)
        if entry is None:
            return VirtualTryOnResult(job_id=job_id, status="failed", error="작업을 찾을 수 없습니다.")

        elapsed = time.time() - entry["created_at"]
        if elapsed < _PROCESSING_AFTER_SECONDS:
            return VirtualTryOnResult(job_id=job_id, status="queued")
        if elapsed < _SUCCEEDED_AFTER_SECONDS:
            return VirtualTryOnResult(job_id=job_id, status="processing")

        if entry["error"]:
            return VirtualTryOnResult(job_id=job_id, status="failed", error=entry["error"])

        encoded = base64.b64encode(entry["result_bytes"]).decode("ascii")
        return VirtualTryOnResult(
            job_id=job_id, status="succeeded", result_image_url=f"data:image/jpeg;base64,{encoded}"
        )
