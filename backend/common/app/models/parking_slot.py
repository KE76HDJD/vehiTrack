from sqlalchemy import Column, String, Integer, ForeignKey, Float, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from enum import Enum
from ..database import Base

class SlotType(str, Enum):
    STANDARD = "standard"
    PMR = "pmr"
    VIP = "vip"
    MOTORCYCLE = "motorcycle"
    TRUCK = "truck"

class SlotStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"

class ParkingSlot(Base):
    __tablename__ = "parking_slots"
    __table_args__ = {"schema": "core"}

    slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("core.zones.zone_id"), nullable=False)
    slot_code = Column(String(20), unique=True, nullable=False)
    slot_type = Column(SQLEnum(SlotType, name="slot_type", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=SlotType.STANDARD)
    slot_status = Column(SQLEnum(SlotStatus, name="slot_status", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=SlotStatus.AVAILABLE)
    pos_x = Column(Float)
    pos_y = Column(Float)
    is_active = Column(Boolean, nullable=False, default=True)
