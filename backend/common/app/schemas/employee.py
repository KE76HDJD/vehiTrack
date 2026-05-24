from uuid import UUID
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.employee import EmployeeRole

class EmployeeBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: EmployeeRole

class EmployeeCreate(EmployeeBase):
    password: str
    phone: Optional[str] = None

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[EmployeeRole] = None

class EmployeeOut(EmployeeBase):
    employee_id: UUID
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
