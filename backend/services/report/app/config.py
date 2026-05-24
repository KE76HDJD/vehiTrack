"""Report Service Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Report service settings."""

    SERVICE_NAME: str = "report"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+asyncpg://vehitrack_user:password@postgres:5432/vehitrack"
    REDIS_URL: str = "redis://:password@redis:6379/0"
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"

    # MinIO settings
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "vehitrack_minio"
    MINIO_SECRET_KEY: str = "password"
    MINIO_BUCKET: str = "reports"

    class Config:
        env_file = ".env"
