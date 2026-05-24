from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert, AlertType, AlertSeverity, AlertStatus
import uuid
from datetime import datetime
from app.core.events import kafka_manager

class AlertService:
    @staticmethod
    async def create_alert(
        db: AsyncSession,
        alert_type: AlertType,
        severity: AlertSeverity,
        message: str,
        vehicle_id: uuid.UUID = None,
        zone_id: uuid.UUID = None,
        session_id: uuid.UUID = None,
        photo_url: str = None
    ):
        new_alert = Alert(
            alert_type=alert_type,
            severity=severity,
            message=message,
            vehicle_id=vehicle_id,
            zone_id=zone_id,
            session_id=session_id,
            photo_url=photo_url,
            status=AlertStatus.OPEN,
            triggered_at=datetime.utcnow()
        )
        db.add(new_alert)
        await db.flush()

        kafka_manager.send_event("alert.created", str(new_alert.alert_id), {
            "alert_id": str(new_alert.alert_id),
            "type": alert_type.value,
            "severity": severity.value,
            "message": message
        })
        
        return new_alert

alert_service = AlertService()
