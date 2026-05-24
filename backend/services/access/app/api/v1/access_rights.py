from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models import AccessRight
from backend.common.app.schemas.access_right import AccessRightOut, AccessRightCreate
from backend.common.app.core.permissions import require_roles
from backend.common.app.models import Employee

router = APIRouter()

@router.get("/", response_model=List[AccessRightOut])
async def read_access_rights(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin"))
):
    result = await db.execute(select(AccessRight))
    return result.scalars().all()

@router.post("/", response_model=AccessRightOut)
async def create_access_right(
    right_in: AccessRightCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin"))
):
    db_obj = AccessRight(**right_in.dict(), granted_by=current_user.employee_id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
