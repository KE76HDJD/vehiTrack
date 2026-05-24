import asyncio
import uuid
from datetime import datetime, timedelta
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.employee import Employee, EmployeeRole
from app.models.vehicle import Vehicle, VehicleType
from app.models.zone import Zone
from app.models.parking_slot import ParkingSlot, SlotType, SlotStatus
from app.models.vehicle_session import VehicleSession, SessionStatus
from app.config import settings

# Pre-hashed bcrypt for "password123"
HASHED_PASSWORD = "$2b$12$6uXbW/oNlP9m.XoZ3YlG0.5zXGZf3Y5Z/Gf/ZGfZGfZGfZGfZGfZG"

async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # 1. Employees (1 Admin, 3 Managers, 10 Employees)
        employees = []
        # Admin
        admin = Employee(
            email="admin@vehitrack.pro",
            hashed_password=HASHED_PASSWORD,
            first_name="Admin", last_name="User",
            role=EmployeeRole.ADMIN
        )
        employees.append(admin)
        
        # Managers
        for i in range(3):
            m = Employee(
                email=f"manager{i}@vehitrack.pro",
                hashed_password=HASHED_PASSWORD,
                first_name=f"Manager", last_name=str(i),
                role=EmployeeRole.MANAGER
            )
            employees.append(m)
            
        # Employees
        for i in range(10):
            e = Employee(
                email=f"user{i}@vehitrack.pro",
                hashed_password=HASHED_PASSWORD,
                first_name="Employee", last_name=str(i),
                role=EmployeeRole.EMPLOYE
            )
            employees.append(e)
            
        session.add_all(employees)
        await session.flush()

        # 2. Zones (already created in migration, but we can fetch them or add more)
        # For simplicity, we'll use the ones from migration or add specific ones here if needed.
        # Let's add 3 zones.
        zones = [
            Zone(name="North Lot", capacity=40, allowed_vehicle_types=[VehicleType.CAR, VehicleType.MOTORCYCLE]),
            Zone(name="South Lot", capacity=50, allowed_vehicle_types=[VehicleType.CAR]),
            Zone(name="VIP Area", capacity=10, allowed_vehicle_types=[VehicleType.CAR, VehicleType.VAN])
        ]
        session.add_all(zones)
        await session.flush()

        # 3. Parking Slots (30 slots)
        slots = []
        for zone in zones:
            for i in range(10):
                s = ParkingSlot(
                    zone_id=zone.zone_id,
                    slot_code=f"{zone.name[:1]}-{i:02d}",
                    slot_type=SlotType.STANDARD if i < 8 else SlotType.VIP,
                    slot_status=SlotStatus.AVAILABLE,
                    pos_x=random.uniform(0, 100),
                    pos_y=random.uniform(0, 100)
                )
                slots.append(s)
        session.add_all(slots)
        await session.flush()

        # 4. Vehicles (20 vehicles)
        vehicles = []
        plates = ["ABC-1234", "XYZ-9876", "TG-4422", "AB-5544", "K-9988", "LO-1122", "RE-3344", "WE-9900"]
        for i in range(20):
            owner = random.choice(employees)
            v = Vehicle(
                owner_id=owner.employee_id,
                plate_number=f"TG-{random.randint(1000, 9999)}-{chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}",
                vehicle_type=random.choice(list(VehicleType)),
                brand=random.choice(["Toyota", "Mercedes", "Tesla", "Honda", "BMW"]),
                model="Model " + str(i),
                color=random.choice(["Black", "White", "Silver", "Blue", "Red"])
            )
            vehicles.append(v)
        session.add_all(vehicles)
        await session.flush()

        # 5. Sessions (50 sessions)
        for i in range(50):
            v = random.choice(vehicles)
            z = random.choice(zones)
            entry = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            exit = entry + timedelta(minutes=random.randint(30, 480))
            
            s = VehicleSession(
                vehicle_id=v.vehicle_id,
                zone_id=z.zone_id,
                entry_time=entry,
                exit_time=exit,
                duration_minutes=random.randint(30, 480),
                status=SessionStatus.COMPLETED,
                ocr_confidence=random.uniform(0.85, 0.99),
                is_anomaly=random.random() < 0.05
            )
            session.add(s)

        await session.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
