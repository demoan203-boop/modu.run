import re

import httpx

from app.core.config import settings

NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json"

_TAG_RE = re.compile(r"<.*?>")


def _strip_tags(text: str) -> str:
    return _TAG_RE.sub("", text)


class NaverShoppingError(Exception):
    pass


async def search_products(keyword: str, sort: str = "sim", display: int = 100) -> list[dict]:
    if not settings.naver_client_id or not settings.naver_client_secret:
        raise NaverShoppingError("네이버 API 키가 설정되지 않았습니다.")

    headers = {
        "X-Naver-Client-Id": settings.naver_client_id,
        "X-Naver-Client-Secret": settings.naver_client_secret,
    }
    params = {"query": keyword, "display": display, "sort": sort}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(NAVER_SHOP_URL, headers=headers, params=params)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise NaverShoppingError(f"네이버 쇼핑 API 호출에 실패했습니다: {exc}") from exc

    items = response.json().get("items", [])
    return [
        {
            "title": _strip_tags(item["title"]),
            "price": int(item["lprice"]) if item.get("lprice") else 0,
            "mall_name": item.get("mallName", ""),
            "image_url": item.get("image", ""),
            "link": item.get("link", ""),
            "category": item.get("category1", ""),
        }
        for item in items
    ]
