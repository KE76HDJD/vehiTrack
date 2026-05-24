from enum import Enum
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base

class EmployeeRole(str, Enum):
    GARDIEN = "gardien"
    EMPLOYE = "employe"
    MANAGER = "manager"
    ADMIN = "admin"

class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = {"schema": "core"}

    employee_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(EmployeeRole, name="employee_role", schema="core", values_callable=lambda x: [e.value for e in x]), nullable=False, default=EmployeeRole.EMPLOYE)
    phone = Column(String(20))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
