from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models.employee import Employee
from backend.common.app.schemas.employee import EmployeeOut, EmployeeCreate, EmployeeUpdate
from backend.common.app.schemas.common import APIResponse
from backend.common.app.security import get_password_hash, get_current_user
from backend.common.app.permissions import require_roles

router = APIRouter()

@router.get("/", response_model=APIResponse[List[EmployeeOut]])
async def read_employees(
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin", "manager"))
):
    result = await db.execute(select(Employee))
    employees = result.scalars().all()
    return APIResponse(success=True, data=employees)

@router.post("/", response_model=APIResponse[EmployeeOut], status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_in: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin"))
):
    result = await db.execute(select(Employee).where(Employee.email == employee_in.email))
    if result.scalar_one_or_none():
        return APIResponse(
            success=False,
            error_code="EMAIL_ALREADY_EXISTS",
            message="Cet email est déjà utilisé."
        )
    
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
    return APIResponse(success=True, data=db_obj)
