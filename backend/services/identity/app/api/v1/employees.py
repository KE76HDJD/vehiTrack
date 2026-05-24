from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models import Employee
from backend.common.app.schemas.employee import EmployeeOut, EmployeeCreate, EmployeeUpdate
from backend.common.app.core.security import get_password_hash
from backend.common.app.core.permissions import require_roles

router = APIRouter()

@router.get("/", response_model=List[EmployeeOut])
async def read_employees(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin", "manager"))
):
    result = await db.execute(select(Employee))
    return result.scalars().all()

@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_in: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin"))
):
    result = await db.execute(select(Employee).where(Employee.email == employee_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_obj = Employee(
        email=employee_in.email,
        hashed_password=get_password_hash(employee_in.password),
        first_name=employee_in.first_name,
        last_name=employee_in.last_name,
        role=employee_in.role,
        phone=employee_in.phone
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
