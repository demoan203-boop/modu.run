from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core import memory_store
from app.db.models import CartItem, User
from app.db.session import get_db_optional
from app.models.schemas import CartItemCreate, CartItemOut

router = APIRouter()


@router.post("/cart", response_model=CartItemOut, status_code=201)
async def add_to_cart(
    payload: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> CartItem:
    if db is None:
        return memory_store.add_cart_item(**payload.model_dump())

    existing = await db.scalar(
        select(CartItem).where(CartItem.user_id == current_user.id, CartItem.link == payload.link)
    )
    if existing is not None:
        return existing

    item = CartItem(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/cart", response_model=list[CartItemOut])
async def list_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> list[CartItem]:
    if db is None:
        return memory_store.list_cart_items()

    result = await db.scalars(
        select(CartItem).where(CartItem.user_id == current_user.id).order_by(CartItem.created_at.desc())
    )
    return list(result.all())


@router.delete("/cart/{item_id}", status_code=204)
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> None:
    if db is None:
        if not memory_store.remove_cart_item(item_id):
            raise HTTPException(status_code=404, detail="장바구니에서 해당 상품을 찾을 수 없습니다.")
        return

    item = await db.get(CartItem, item_id)
    if item is None or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="장바구니에서 해당 상품을 찾을 수 없습니다.")

    await db.delete(item)
    await db.commit()
