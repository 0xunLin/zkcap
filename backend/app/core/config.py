from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "zkCAP"
    APP_ENV: str = "development"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/zkcap"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
