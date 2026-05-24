from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models.access_right import AccessRight
from backend.common.app.models.employee import Employee
from backend.common.app.schemas.access_right import AccessRightOut, AccessRightCreate
from backend.common.app.schemas.common import APIResponse
from backend.common.app.permissions import require_roles

router = APIRouter()

@router.get("/", response_model=APIResponse[List[AccessRightOut]])
async def read_access_rights(
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin"))
):
    result = await db.execute(select(AccessRight))
    rights = result.scalars().all()
    return APIResponse(success=True, data=rights)

@router.post("/", response_model=APIResponse[AccessRightOut])
async def create_access_right(
    right_in: AccessRightCreate,
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin"))
):
    db_obj = AccessRight(**right_in.model_dump(), granted_by=admin_user.employee_id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return APIResponse(success=True, data=db_obj)
