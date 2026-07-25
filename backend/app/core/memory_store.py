"""DATABASE_URL이 설정되지 않았을 때만 쓰는 임시 인메모리 저장소.

DB 없이도 로그인(관리자 데모 계정) 이후 장바구니/AI 가상 착용 흐름을 그대로
체험할 수 있게 하기 위한 임시방편이다. 서버 프로세스가 재시작되면 전부 사라지고,
DATABASE_URL을 설정하면 이 모듈은 더 이상 쓰이지 않는다 (각 라우트가 db is None일
때만 여기로 분기함).
"""

import itertools
from datetime import datetime, timezone

from app.db.models import CartItem, VirtualTryOnJob

_cart_items: list[CartItem] = []
_cart_id_counter = itertools.count(1)
_jobs: dict[str, VirtualTryOnJob] = {}


def list_cart_items() -> list[CartItem]:
    return list(_cart_items)


def get_cart_item(item_id: int) -> CartItem | None:
    return next((item for item in _cart_items if item.id == item_id), None)


def add_cart_item(*, title: str, price: int, mall_name: str, image_url: str, link: str, category: str) -> CartItem:
    existing = next((item for item in _cart_items if item.link == link), None)
    if existing is not None:
        return existing

    item = CartItem(
        id=next(_cart_id_counter),
        user_id=-1,
        title=title,
        price=price,
        mall_name=mall_name,
        image_url=image_url,
        link=link,
        category=category,
        created_at=datetime.now(timezone.utc),
    )
    _cart_items.append(item)
    return item


def remove_cart_item(item_id: int) -> bool:
    global _cart_items
    before = len(_cart_items)
    _cart_items = [item for item in _cart_items if item.id != item_id]
    return len(_cart_items) != before


def save_job(job: VirtualTryOnJob) -> None:
    _jobs[job.id] = job


def get_job(job_id: str) -> VirtualTryOnJob | None:
    return _jobs.get(job_id)


def reset() -> None:
    """테스트 전용 - 프로세스 전역 상태를 초기화한다."""
    _cart_items.clear()
    _jobs.clear()
