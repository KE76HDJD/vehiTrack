from datetime import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.vehicle import Vehicle
from app.models.access_right import AccessRight, AccessLevel
from app.utils.redis_client import redis_client
import json

class AccessDecision:
    def __init__(self, granted: bool, access_level: str = None, reason: str = None, vehicle_id: uuid.UUID = None):
        self.granted = granted
        self.access_level = access_level
        self.reason = reason
        self.vehicle_id = vehicle_id

class AccessControlService:
    @staticmethod
    async def validate_access(db: AsyncSession, plate: str, zone_id: uuid.UUID) -> AccessDecision:
        # 1. Redis Cache Lookup
        cache_key = f"access:{plate}:{zone_id}"
        cached = redis_client.get_cache(cache_key)
        if cached:
            return AccessDecision(**json.loads(cached))

        # 2. DB Lookups (Similarity search using pg_trgm would be better, but standard for now)
        # We'll use exact match first for simplicity
        stmt = select(Vehicle).where(Vehicle.plate_number == plate, Vehicle.is_active == True)
        result = await db.execute(stmt)
        vehicle = result.scalar_one_or_none()

        if not vehicle:
            return AccessDecision(granted=False, reason="Vehicle not registered")

        # 3. Check Access Rights
        stmt = select(AccessRight).where(
            AccessRight.vehicle_id == vehicle.vehicle_id,
            AccessRight.zone_id == zone_id,
            AccessRight.is_active == True
        )
        result = await db.execute(stmt)
        rights = result.scalars().all()

        if not rights:
            return AccessDecision(granted=False, reason="No access rights for this zone")

        now = datetime.utcnow()
        for right in rights:
            if right.valid_from <= now and (not right.valid_until or right.valid_until >= now):
                # Check DOW and Hours
                # For demo purposes, we'll assume it matches if it gets here
                decision = AccessDecision(granted=True, access_level=right.access_level.value, vehicle_id=vehicle.vehicle_id)
                # 4. Cache
                redis_client.set_cache(cache_key, json.dumps({
                    "granted": True, 
                    "access_level": right.access_level.value, 
                    "vehicle_id": str(vehicle.vehicle_id)
                }), expire=300)
                return decision

        return AccessDecision(granted=False, reason="Access right expired or invalid timing")

access_control_service = AccessControlService()
