"""OCR Service Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """OCR service settings."""

    SERVICE_NAME: str = "ocr"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+asyncpg://vehitrack_user:password@postgres:5432/vehitrack"
    REDIS_URL: str = "redis://:password@redis:6379/0"
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"

    # OCR specific
    OCR_MIN_CONFIDENCE: float = 0.60
    OCR_MODEL_PATH: str = "/models/ocr_model"

    class Config:
        env_file = ".env"
