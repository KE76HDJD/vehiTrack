from sqlalchemy import Column, String, DateTime, ForeignKey, Index, text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import TSTZRANGE, UUID, ExcludeConstraint
from sqlalchemy.sql import func
import uuid
from enum import Enum
from ..database import Base

class ReservationStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    USED = "used"
    EXPIRED = "expired"
    NO_SHOW = "no_show"

class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (
        ExcludeConstraint(
            ("slot_id", "="),
            (text("tstzrange(reserved_from, reserved_until, '[)')"), "&&"),
            name="excl_no_overlap",
            where=text("status = 'confirmed'")
        ),
        {"schema": "core"}
    )

    reservation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("core.vehicles.vehicle_id"), nullable=False)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("core.parking_slots.slot_id"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("core.employees.employee_id"), nullable=False)
    reserved_from = Column(DateTime(timezone=True), nullable=False)
    reserved_until = Column(DateTime(timezone=True), nullable=False)
    status = Column(SQLEnum(ReservationStatus, name="reservation_status", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=ReservationStatus.CONFIRMED)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
