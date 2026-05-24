from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from enum import Enum
from ..database import Base

class AlertType(str, Enum):
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    OVERSTAY = "overstay"
    OCR_FAILURE = "ocr_failure"
    IOT_DISCONNECTED = "iot_disconnected"
    INTRUSION = "intrusion"
    UNKNOWN_PLATE = "unknown_plate"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertStatus(str, Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    ESCALATED = "escalated"

class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = {"schema": "core"}

    alert_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True))
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("core.vehicles.vehicle_id"))
    zone_id = Column(UUID(as_uuid=True), ForeignKey("core.zones.zone_id"))
    alert_type = Column(SQLEnum(AlertType, name="alert_type", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False)
    severity = Column(SQLEnum(AlertSeverity, name="alert_severity", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=AlertSeverity.MEDIUM)
    message = Column(Text, nullable=False)
    photo_url = Column(Text)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    acknowledged_at = Column(DateTime(timezone=True))
    handled_by = Column(UUID(as_uuid=True), ForeignKey("core.employees.employee_id"))
    resolution_notes = Column(Text)
    status = Column(SQLEnum(AlertStatus, name="alert_status", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=AlertStatus.OPEN)
