from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SearchRequest(BaseModel):
    query: str


class Product(BaseModel):
    title: str
    price: int
    mall_name: str
    image_url: str
    link: str
    category: str = ""


class SearchResponse(BaseModel):
    ai_summary: str
    products: list[Product]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class SearchHistoryOut(BaseModel):
    id: int
    query: str
    ai_summary: str
    created_at: datetime

    model_config = {"from_attributes": True}
