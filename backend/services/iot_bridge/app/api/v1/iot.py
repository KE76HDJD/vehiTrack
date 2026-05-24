from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from backend.common.app.schemas.common import APIResponse
from pydantic import BaseModel
import time

router = APIRouter()

class TelemetryData(BaseModel):
    device_id: str
    sensor_type: str # 'camera', 'loop_detector', 'ultrasonic'
    value: str
    timestamp: Optional[float] = None

@router.post("/telemetry", response_model=APIResponse[dict])
async def receive_telemetry(data: TelemetryData):
    # Placeholder for Kafka producer
    # kafka_producer.send('iot_telemetry', data.model_dump())
    
    return APIResponse(
        success=True,
        message="Données reçues et transmises.",
        data={"received_at": time.time()}
    )
