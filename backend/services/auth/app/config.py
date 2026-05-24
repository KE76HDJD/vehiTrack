"""Authentication Service Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Auth service settings."""

    # Service metadata
    SERVICE_NAME: str = "auth"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://vehitrack_user:password@postgres:5432/vehitrack"

    # Redis
    REDIS_URL: str = "redis://:password@redis:6379/0"
    REDIS_PASSWORD: str = "password"

    # JWT Settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"

    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    class Config:
        env_file = ".env"
        case_sensitive = True
