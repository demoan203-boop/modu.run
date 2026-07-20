import json
import logging

import anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """당신은 쇼핑 검색 도우미입니다. 사용자의 자연어 요청을 분석해 다음 JSON 형식으로만 응답하세요:

{"keywords": "네이버 쇼핑 검색에 사용할 핵심 키워드", "max_price": 최대가격(정수, 없으면 null), "summary": "사용자에게 보여줄 한글 한줄 요약"}

설명 없이 JSON만 출력하세요."""


class AIQueryParseResult:
    def __init__(self, keywords: str, max_price: int | None, summary: str):
        self.keywords = keywords
        self.max_price = max_price
        self.summary = summary


def parse_query(query: str) -> AIQueryParseResult:
    if not settings.anthropic_api_key:
        return AIQueryParseResult(keywords=query, max_price=None, summary=f'"{query}" 검색 결과입니다.')

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": query}],
        )
        text = next(block.text for block in response.content if block.type == "text")
        data = json.loads(text)
        return AIQueryParseResult(
            keywords=data.get("keywords") or query,
            max_price=data.get("max_price"),
            summary=data.get("summary") or f'"{query}" 검색 결과입니다.',
        )
    except Exception:
        logger.exception("AI query parsing failed, falling back to raw query")
        return AIQueryParseResult(keywords=query, max_price=None, summary=f'"{query}" 검색 결과입니다.')
