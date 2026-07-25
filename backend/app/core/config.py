from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    naver_client_id: str = ""
    naver_client_secret: str = ""
    anthropic_api_key: str = ""
    google_client_id: str = ""

    database_url: str = ""
    jwt_secret_key: str = ""
    jwt_expire_minutes: int = 60 * 24 * 7  # 7일

    cors_origins: list[str] = ["http://localhost:5173"]

    # 프로덕션(예: 프런트 modu.run / 백엔드 api.modu.run)에서만 오버라이드.
    # 로컬 개발(HTTP, 동일 출처 프록시)에서는 기본값 그대로 둔다.
    cookie_domain: str | None = None
    cookie_secure: bool = False

    # AI 가상 착용: 키가 없어도 mock 프로바이더로 항상 동작한다 (build/런타임 실패 없음).
    virtual_try_on_provider: str = "mock"
    virtual_try_on_api_url: str = ""
    virtual_try_on_api_key: str = ""
    virtual_try_on_webhook_secret: str = ""


settings = Settings()
