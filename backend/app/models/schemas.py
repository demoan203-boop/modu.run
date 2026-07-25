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


class CartItemCreate(BaseModel):
    title: str
    price: int
    mall_name: str
    image_url: str
    link: str
    category: str = ""


class CartItemOut(BaseModel):
    id: int
    title: str
    price: int
    mall_name: str
    image_url: str
    link: str
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=72)


class GoogleLoginRequest(BaseModel):
    id_token: str


class KakaoLoginRequest(BaseModel):
    access_token: str


class VirtualTryOnJobOut(BaseModel):
    id: str
    status: str
    product_title: str
    category: str
    provider: str
    result_image_url: str | None = None
    error_message: str | None = None
    created_at: datetime
