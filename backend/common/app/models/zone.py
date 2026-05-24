from sqlalchemy import Column, String, Integer, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base
from .vehicle import VehicleType

class Zone(Base):
    __tablename__ = "zones"
    __table_args__ = {"schema": "core"}

    zone_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String)
    capacity = Column(Integer, nullable=False)
    allowed_vehicle_types = Column(ARRAY(SQLEnum(VehicleType, name="vehicle_type", schema="core", values_callable=lambda x: [e.value for e in x])), nullable=False, default=[VehicleType.CAR])
    max_duration_minutes = Column(Integer, default=720)
    is_active = Column(Boolean, nullable=False, default=True)
