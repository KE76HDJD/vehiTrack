from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime, timezone

T = TypeVar('T')

class PaginationMeta(BaseModel):
    page: int
    size: int
    total: int
    pages: int

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: str = ""
    pagination: Optional[PaginationMeta] = None
    error_code: Optional[str] = None

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
    )

class BaseSchema(BaseModel):
    """Base schema with UTC datetime validation."""
    
    @field_validator('*', mode='before')
    @classmethod
    def ensure_utc(cls, v: Any):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc)
            return v.astimezone(timezone.utc)
        if isinstance(v, str):
            try:
                # Handle 'Z' suffix and convert to +00:00 for fromisoformat
                dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                return dt.astimezone(timezone.utc)
            except ValueError:
                return v
        return v

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
    )
