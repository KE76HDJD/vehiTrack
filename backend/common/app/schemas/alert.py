from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from ..models.alert import AlertType, AlertSeverity, AlertStatus

class AlertBase(BaseModel):
    session_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    zone_id: Optional[UUID] = None
    alert_type: AlertType
    severity: AlertSeverity = AlertSeverity.MEDIUM
    message: str
    photo_url: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertOut(AlertBase):
    alert_id: UUID
    triggered_at: datetime
    acknowledged_at: Optional[datetime] = None
    handled_by: Optional[UUID] = None
    resolution_notes: Optional[str] = None
    status: AlertStatus

    class Config:
        from_attributes = True
