from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HeatmapData(BaseModel):
    day: int
    hour: int
    count: int

class EntryHeatmapData(BaseModel):
    entry_point: str
    entry_time: datetime
    exit_time: Optional[datetime]
    vehicle_id: str
    count: int
    
    class Config:
        from_attributes = True

class DailyStats(BaseModel):
    date: datetime
    entries: int
    exits: int
    peak_hour: int
    average_duration: float
    
    class Config:
        from_attributes = True

class AnalyticsOverview(BaseModel):
    total_vehicles: int
    active_sessions: int
    available_slots: int
    alerts_today: int
