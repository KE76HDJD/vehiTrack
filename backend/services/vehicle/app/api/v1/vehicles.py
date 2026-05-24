from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models.vehicle import Vehicle
from backend.common.app.models.employee import Employee
from backend.common.app.schemas.vehicle import VehicleOut, VehicleCreate, VehicleUpdate
from backend.common.app.schemas.common import APIResponse
from backend.common.app.permissions import require_roles

router = APIRouter()

@router.get("/", response_model=APIResponse[List[VehicleOut]])
async def read_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin", "manager", "gardien"))
):
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    return APIResponse(success=True, data=vehicles)

@router.post("/", response_model=APIResponse[VehicleOut])
async def create_vehicle(
    vehicle_in: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(require_roles("admin"))
):
    db_obj = Vehicle(**vehicle_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return APIResponse(success=True, data=db_obj)
