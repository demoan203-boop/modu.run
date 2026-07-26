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
    # 회원가입(EmailStr)과 달리 str로 둔다 - DATABASE_URL 미설정 시의 임시 데모 로그인("admin")은
    # 이메일 형식이 아니어서, 여기서 EmailStr로 검증하면 요청 자체가 422로 막혀버린다.
    email: str
    password: str
    remember: bool = True


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
