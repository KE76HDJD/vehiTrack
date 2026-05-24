from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID
from ..models.access_right import AccessLevel

class AccessRightBase(BaseModel):
    vehicle_id: UUID
    zone_id: UUID
    access_level: AccessLevel = AccessLevel.STANDARD
    allowed_days: List[int] = [1, 2, 3, 4, 5]
    allowed_hours: Dict[str, str] = {"start": "07:00", "end": "20:00"}
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None

class AccessRightCreate(AccessRightBase):
    pass

class AccessRightOut(AccessRightBase):
    right_id: UUID
    is_active: bool
    granted_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
