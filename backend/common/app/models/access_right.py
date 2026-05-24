from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.sql import func
import uuid
from enum import Enum
from ..database import Base

class AccessLevel(str, Enum):
    STANDARD = "standard"
    VIP = "vip"
    TEMPORARY = "temporary"
    EMERGENCY = "emergency"

class AccessRight(Base):
    __tablename__ = "access_rights"
    __table_args__ = {"schema": "access_ctrl"}

    right_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("core.vehicles.vehicle_id", ondelete="CASCADE"), nullable=False)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("core.zones.zone_id"), nullable=False)
    access_level = Column(SQLEnum(AccessLevel, name="access_level", schema="access_ctrl", values_callable=lambda x: [e.value for e in x]), nullable=False, default=AccessLevel.STANDARD)
    allowed_days = Column(ARRAY(Integer), nullable=False, default=[1, 2, 3, 4, 5])
    allowed_hours = Column(JSONB, nullable=False, default={"start": "07:00", "end": "20:00"})
    valid_from = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    valid_until = Column(DateTime(timezone=True))
    is_active = Column(Boolean, nullable=False, default=True)
    granted_by = Column(UUID(as_uuid=True), ForeignKey("core.employees.employee_id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
