from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models import VehicleSession
from backend.common.app.schemas.session import SessionOut
from backend.common.app.core.permissions import require_roles
from backend.common.app.models import Employee

router = APIRouter()

@router.get("/", response_model=List[SessionOut])
async def read_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin", "manager", "gardien"))
):
    result = await db.execute(select(VehicleSession))
    return result.scalars().all()

@router.get("/active", response_model=List[SessionOut])
async def read_active_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin", "manager", "gardien"))
):
    result = await db.execute(select(VehicleSession).where(VehicleSession.status == "active"))
    return result.scalars().all()
