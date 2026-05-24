from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from enum import Enum
from ..database import Base

class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FORCE_CLOSED = "force_closed"
    ANOMALY = "anomaly"

class VehicleSession(Base):
    __tablename__ = "vehicle_sessions"
    __table_args__ = {"schema": "core"}

    session_id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("core.vehicles.vehicle_id"), nullable=False)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("core.zones.zone_id"), nullable=False)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("core.parking_slots.slot_id"))
    entry_time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True)
    exit_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    status = Column(SQLEnum(SessionStatus, name="session_status", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=SessionStatus.ACTIVE)
    ocr_confidence = Column(Float)
    entry_photo_url = Column(Text)
    exit_photo_url = Column(Text)
    is_anomaly = Column(Boolean, nullable=False, default=False)
    notes = Column(Text)
