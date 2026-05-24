from fastapi import APIRouter, Depends
from backend.common.app.schemas.common import APIResponse
from typing import Dict, List

router = APIRouter()

@router.get("/status-overview", response_model=APIResponse[dict])
async def get_status_overview():
    # Placeholder for status aggregation
    return APIResponse(
        success=True,
        data={
            "active_sessions": 42,
            "available_slots": 158,
            "system_alerts": 0,
            "last_entry": "ABC-1234"
        }
    )
