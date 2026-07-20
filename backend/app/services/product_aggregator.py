# 네이버 쇼핑은 실제 판매가를 옵션가로 숨기고 기본가를 비정상적으로 낮게(10~20원) 등록해
# 가격순 정렬 상단을 차지하는 어뷰징 상품이 섞여 있다. 이런 상품을 걸러내는 최소 가격 기준.
MIN_VALID_PRICE = 1000


def _normalize_title(title: str) -> str:
    return "".join(title.split())[:20].lower()


def refine(products: list[dict], max_price: int | None) -> list[dict]:
    filtered = [p for p in products if p["price"] >= MIN_VALID_PRICE]
    if max_price:
        filtered = [p for p in filtered if p["price"] <= max_price]

    filtered.sort(key=lambda p: p["price"])

    seen_titles: set[str] = set()
    deduped = []
    for product in filtered:
        key = _normalize_title(product["title"])
        if key in seen_titles:
            continue
        seen_titles.add(key)
        deduped.append(product)

    return deduped
