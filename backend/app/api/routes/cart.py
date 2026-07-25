from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import CartItem, User
from app.models.schemas import CartItemCreate, CartItemOut

router = APIRouter()


@router.post("/cart", response_model=CartItemOut, status_code=201)
async def add_to_cart(
    payload: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartItem:
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
    db: AsyncSession = Depends(get_db),
) -> list[CartItem]:
    result = await db.scalars(
        select(CartItem).where(CartItem.user_id == current_user.id).order_by(CartItem.created_at.desc())
    )
    return list(result.all())


@router.delete("/cart/{item_id}", status_code=204)
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await db.get(CartItem, item_id)
    if item is None or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="장바구니에서 해당 상품을 찾을 수 없습니다.")

    await db.delete(item)
    await db.commit()
