from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models.session import VehicleSession, SessionStatus
from backend.common.app.models.employee import Employee
from backend.common.app.schemas.session import SessionOut
from backend.common.app.schemas.common import APIResponse
from backend.common.app.permissions import require_roles

router = APIRouter()

@router.get("/", response_model=APIResponse[List[SessionOut]])
async def read_sessions(
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin", "manager", "gardien"))
):
    result = await db.execute(select(VehicleSession))
    sessions = result.scalars().all()
    return APIResponse(success=True, data=sessions)

@router.get("/active", response_model=APIResponse[List[SessionOut]])
async def read_active_sessions(
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin", "manager", "gardien"))
):
    result = await db.execute(select(VehicleSession).where(VehicleSession.status == SessionStatus.ACTIVE))
    sessions = result.scalars().all()
    return APIResponse(success=True, data=sessions)
