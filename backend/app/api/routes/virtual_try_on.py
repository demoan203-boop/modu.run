import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core import memory_store
from app.core.config import settings
from app.db.models import CartItem, User, VirtualTryOnJob
from app.db.session import get_db_optional
from app.models.schemas import VirtualTryOnJobOut
from app.services.virtual_try_on import VirtualTryOnInput, get_provider
from app.services.virtual_try_on.external_provider import ExternalProviderNotConfiguredError

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def _to_job_out(job: VirtualTryOnJob, *, result_image_url: str | None = None) -> VirtualTryOnJobOut:
    return VirtualTryOnJobOut(
        id=job.id,
        status=job.status,
        product_title=job.product_title,
        category=job.category,
        provider=job.provider,
        result_image_url=result_image_url,
        error_message=job.error_message,
        created_at=job.created_at,
    )


@router.post("/virtual-try-on", response_model=VirtualTryOnJobOut, status_code=201)
async def create_virtual_try_on_job(
    person_image: UploadFile = File(...),
    cart_item_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> VirtualTryOnJobOut:
    if person_image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.")

    image_bytes = await person_image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="이미지를 읽을 수 없습니다. 다른 사진을 선택해주세요.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="이미지 용량은 최대 10MB까지 업로드할 수 있습니다.")

    # 가격/상품 정보는 클라이언트를 신뢰하지 않고 서버가 소유한(본인 장바구니) 레코드에서 다시 조회한다.
    if db is None:
        cart_item = memory_store.get_cart_item(cart_item_id)
        if cart_item is None:
            raise HTTPException(status_code=404, detail="장바구니에서 해당 상품을 찾을 수 없습니다.")
    else:
        cart_item = await db.get(CartItem, cart_item_id)
        if cart_item is None or cart_item.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="장바구니에서 해당 상품을 찾을 수 없습니다.")

    job = VirtualTryOnJob(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        product_title=cart_item.title,
        product_link=cart_item.link,
        category=cart_item.category,
        provider=settings.virtual_try_on_provider,
        status="queued",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    if db is None:
        memory_store.save_job(job)
    else:
        db.add(job)
        await db.commit()
        await db.refresh(job)

    try:
        provider = get_provider()
        result = await provider.create_job(
            job.id,
            VirtualTryOnInput(
                person_image_bytes=image_bytes,
                product_image_url=cart_item.image_url,
                product_id=str(cart_item.id),
                category=cart_item.category,
            ),
        )
    except ExternalProviderNotConfiguredError:
        job.status = "failed"
        job.error_message = "AI 가상 착용 서비스가 아직 연결되지 않았습니다."
        if db is None:
            memory_store.save_job(job)
        else:
            await db.commit()
        raise HTTPException(status_code=503, detail=job.error_message) from None
    except Exception:
        job.status = "failed"
        job.error_message = "가상 착용 결과를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요."
        if db is None:
            memory_store.save_job(job)
        else:
            await db.commit()
        raise HTTPException(status_code=502, detail=job.error_message) from None

    job.status = result.status
    job.error_message = result.error
    job.provider_job_id = result.job_id
    if db is None:
        memory_store.save_job(job)
    else:
        await db.commit()
        await db.refresh(job)

    return _to_job_out(job)


@router.get("/virtual-try-on/status/{job_id}", response_model=VirtualTryOnJobOut)
async def get_virtual_try_on_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> VirtualTryOnJobOut:
    if db is None:
        job = memory_store.get_job(job_id)
        if job is None or job.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")
    else:
        job = await db.get(VirtualTryOnJob, job_id)
        if job is None or job.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    # 완료된 작업이라도 결과 이미지 자체는 저장하지 않으므로(개인정보 방침), succeeded 상태에서도
    # 매번 provider에서 다시 조회해 URL을 채운다. failed는 종결 상태라 그대로 반환한다.
    if job.status == "failed":
        return _to_job_out(job)

    provider = get_provider()
    result = await provider.get_job(job.provider_job_id or job.id)

    job.status = result.status
    job.error_message = result.error
    if db is None:
        memory_store.save_job(job)
    else:
        await db.commit()
        await db.refresh(job)

    return _to_job_out(job, result_image_url=result.result_image_url)
