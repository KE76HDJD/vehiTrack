from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from backend.common.app.schemas.common import APIResponse
from pydantic import BaseModel
import time

router = APIRouter()

class NotificationRequest(BaseModel):
    recipient: str
    channel: str # 'email', 'sms', 'push'
    title: str
    message: str
    priority: str = "normal" # "low", "normal", "high", "critical"

@router.post("/send", response_model=APIResponse[dict])
async def send_notification(notification: NotificationRequest):
    # Placeholder for notification logic (SendGrid, Twilio, etc.)
    # In production, this would queue a task or call an external API
    
    return APIResponse(
        success=True,
        message="Notification envoyée.",
        data={"sent_at": time.time(), "channel": notification.channel}
    )
