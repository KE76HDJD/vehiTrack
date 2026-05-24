from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vehicle_session import VehicleSession, SessionStatus
from app.models.parking_slot import ParkingSlot, SlotStatus
from app.services.access_control_service import access_control_service
from app.core.events import kafka_manager
import uuid
from datetime import datetime

class SessionService:
    @staticmethod
    async def register_entry(db: AsyncSession, plate: str, zone_id: uuid.UUID, ocr_data: dict, photo_url: str):
        # 1. Validate Access
        decision = await access_control_service.validate_access(db, plate, zone_id)
        if not decision.granted:
            kafka_manager.send_event("vehicle.denied", plate, {"plate": plate, "zone_id": str(zone_id), "reason": decision.reason})
            return None, decision.reason

        # 2. Find Slot (first available in zone)
        # ... logic to find slot ...
        
        # 3. Create Session
        new_session = VehicleSession(
            vehicle_id=decision.vehicle_id,
            zone_id=zone_id,
            entry_time=datetime.utcnow(),
            status=SessionStatus.ACTIVE,
            ocr_confidence=ocr_data.get('confidence'),
            entry_photo_url=photo_url
        )
        db.add(new_session)
        await db.flush()

        kafka_manager.send_event("vehicle.entry", str(new_session.session_id), {
            "session_id": str(new_session.session_id),
            "vehicle_id": str(decision.vehicle_id),
            "plate": plate,
            "zone_id": str(zone_id)
        })
        
        return new_session, None

session_service = SessionService()
