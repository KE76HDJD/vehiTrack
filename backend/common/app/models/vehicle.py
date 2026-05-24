from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
import uuid
from ..database import Base

from sqlalchemy.dialects.postgresql import UUID

class VehicleType(str, Enum):
    CAR = "car"
    MOTORCYCLE = "motorcycle"
    TRUCK = "truck"
    VAN = "van"
    VIP = "vip"
    EMERGENCY = "emergency"

class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = {"schema": "core"}

    vehicle_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("core.employees.employee_id", ondelete="RESTRICT"), nullable=False)
    plate_number = Column(String(20), unique=True, index=True, nullable=False)
    plate_country = Column(String(5), nullable=False, default="TG")
    vehicle_type = Column(SQLEnum(VehicleType, name="vehicle_type", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=VehicleType.CAR)
    brand = Column(String(50))
    model = Column(String(50))
    color = Column(String(30))
    photo_url = Column(String)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
