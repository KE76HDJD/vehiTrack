"""Identity Service Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Identity service settings."""

    SERVICE_NAME: str = "identity"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+asyncpg://vehitrack_user:password@postgres:5432/vehitrack"
    REDIS_URL: str = "redis://:password@redis:6379/0"
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"

    class Config:
        env_file = ".env"
