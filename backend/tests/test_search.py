from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_query_parser import AIQueryParseResult

client = TestClient(app)


def test_search_returns_products_sorted_by_price():
    fake_products = [
        {"title": "무선 이어폰 A", "price": 50000, "mall_name": "몰A", "image_url": "", "link": ""},
        {"title": "무선 이어폰 B", "price": 30000, "mall_name": "몰B", "image_url": "", "link": ""},
    ]

    with patch(
        "app.api.routes.search.ai_query_parser.parse_query",
        return_value=AIQueryParseResult(keywords="무선 이어폰", max_price=None, summary="요약"),
    ), patch(
        "app.api.routes.search.search_products",
        new=AsyncMock(return_value=fake_products),
    ):
        response = client.post("/api/search", json={"query": "무선 이어폰"})

    assert response.status_code == 200
    data = response.json()
    assert data["ai_summary"] == "요약"
    assert [p["price"] for p in data["products"]] == [30000, 50000]


def test_search_naver_failure_returns_502():
    from app.services.naver_shopping import NaverShoppingError

    with patch(
        "app.api.routes.search.ai_query_parser.parse_query",
        return_value=AIQueryParseResult(keywords="q", max_price=None, summary="요약"),
    ), patch(
        "app.api.routes.search.search_products",
        new=AsyncMock(side_effect=NaverShoppingError("api down")),
    ):
        response = client.post("/api/search", json={"query": "q"})

    assert response.status_code == 502
