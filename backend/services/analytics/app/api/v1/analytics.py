from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List
from backend.common.app.database import get_db
from backend.common.app.models.employee import Employee
from backend.common.app.schemas.analytics import EntryHeatmapData, DailyStats
from backend.common.app.schemas.common import APIResponse
from backend.common.app.permissions import require_roles

router = APIRouter()

@router.get("/heatmap", response_model=APIResponse[List[EntryHeatmapData]])
async def get_heatmap(
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin", "manager"))
):
    # Query the materialized view
    result = await db.execute(text("SELECT * FROM analytics.entry_heatmap"))
    rows = [dict(row) for row in result.fetchall()]
    return APIResponse(success=True, data=rows)

@router.get("/daily-stats", response_model=APIResponse[List[DailyStats]])
async def get_daily_stats(
    db: AsyncSession = Depends(get_db),
    admin_user: Employee = Depends(require_roles("admin", "manager"))
):
    result = await db.execute(text("SELECT * FROM analytics.daily_stats"))
    rows = [dict(row) for row in result.fetchall()]
    return APIResponse(success=True, data=rows)
