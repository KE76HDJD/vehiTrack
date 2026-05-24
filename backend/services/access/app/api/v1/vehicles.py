from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models import Vehicle
from backend.common.app.schemas.vehicle import VehicleOut, VehicleCreate, VehicleUpdate
from backend.common.app.core.permissions import require_roles
from backend.common.app.models import Employee

router = APIRouter()

@router.get("/", response_model=List[VehicleOut])
async def read_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin", "manager", "gardien"))
):
    result = await db.execute(select(Vehicle))
    return result.scalars().all()

@router.post("/", response_model=VehicleOut)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin"))
):
    db_obj = Vehicle(**vehicle_in.dict())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
