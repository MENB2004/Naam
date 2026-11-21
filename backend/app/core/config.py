from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NAAM (നാം) API"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "naam-insecure-development-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://frontend-nine-orpin-72.vercel.app",
        "https://frontend-l3vmz8bk1-menbs-projects.vercel.app",
    ]

    # Database (Defaults to local SQLite, or postgresql+pg8000:// for pure-Python PostgreSQL / Neon)
    DATABASE_URL: str = "sqlite:///./naam_dev.db"
    DATABASE_URL_UNPOOLED: str | None = None
    NEON_BRANCH: str | None = None
    NEON_BRANCH_ID: str | None = None

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env", "../.env.local", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
