from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.db.models import SearchHistory, User
from app.db.session import get_db, get_db_optional
from app.models.schemas import SearchHistoryOut, SearchRequest, SearchResponse
from app.services import ai_query_parser, product_aggregator
from app.services.naver_shopping import NaverShoppingError, search_products

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession | None = Depends(get_db_optional),
) -> SearchResponse:
    parsed = ai_query_parser.parse_query(request.query)

    try:
        products = await search_products(parsed.keywords)
    except NaverShoppingError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    refined = product_aggregator.refine(products, parsed.max_price)

    if current_user is not None and db is not None:
        db.add(SearchHistory(user_id=current_user.id, query=request.query, ai_summary=parsed.summary))
        await db.commit()

    return SearchResponse(ai_summary=parsed.summary, products=refined)


@router.get("/search/history", response_model=list[SearchHistoryOut])
async def search_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SearchHistory]:
    result = await db.scalars(
        select(SearchHistory)
        .where(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.created_at.desc())
    )
    return list(result.all())
