"""
Kafka Event Producers

Handles publishing events to Kafka topics:
- vehicle.entry: Vehicle enters zone
- vehicle.exit: Vehicle exits zone
- vehicle.denied: Access denied
- alert.created: New alert generated
- alert.escalated: Alert escalated
- iot.heartbeat: IoT device heartbeat
- report.completed: Report generation finished

All producers include retry logic and error handling.
"""

import asyncio
import json
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

try:
    from aiokafka import AIOKafkaProducer
    HAS_KAFKA = True
except ImportError:
    HAS_KAFKA = False

from .logging import get_logger

logger = get_logger("vehitrack.events")


class EventType(str, Enum):
    """Kafka event types"""
    VEHICLE_ENTRY = "vehicle.entry"
    VEHICLE_EXIT = "vehicle.exit"
    VEHICLE_DENIED = "vehicle.denied"
    ALERT_CREATED = "alert.created"
    ALERT_ACKNOWLEDGED = "alert.acknowledged"
    ALERT_ESCALATED = "alert.escalated"
    IOT_HEARTBEAT = "iot.heartbeat"
    REPORT_COMPLETED = "report.completed"
    SESSION_STARTED = "session.started"
    SESSION_ENDED = "session.ended"


class Event:
    """Base event wrapper with metadata"""
    
    def __init__(
        self,
        event_type: EventType,
        data: Dict[str, Any],
        source_service: str = "vehitrack",
        correlation_id: Optional[str] = None
    ):
        self.type = event_type
        self.data = data
        self.source_service = source_service
        self.correlation_id = correlation_id or self._generate_id()
        self.timestamp = datetime.utcnow().isoformat()
        self.version = "1.0"
    
    @staticmethod
    def _generate_id() -> str:
        """Generate correlation ID"""
        import uuid
        return str(uuid.uuid4())
    
    def to_json(self) -> str:
        """Serialize event to JSON"""
        return json.dumps({
            "type": self.type.value,
            "data": self.data,
            "metadata": {
                "source_service": self.source_service,
                "correlation_id": self.correlation_id,
                "timestamp": self.timestamp,
                "version": self.version
            }
        })
    
    def to_bytes(self) -> bytes:
        """Serialize event to bytes for Kafka"""
        return self.to_json().encode('utf-8')


class EventProducer:
    """
    Kafka event producer wrapper.
    
    Handles:
    - Connection management
    - Message serialization
    - Retry logic (exponential backoff)
    - Error handling
    - Batch publishing
    """
    
    def __init__(
        self,
        bootstrap_servers: str = "localhost:9092",
        service_name: str = "vehitrack",
        max_retries: int = 3,
        retry_backoff_ms: int = 100
    ):
        self.bootstrap_servers = bootstrap_servers
        self.service_name = service_name
        self.max_retries = max_retries
        self.retry_backoff_ms = retry_backoff_ms
        self.producer: Optional[AIOKafkaProducer] = None
        self.is_connected = False
    
    async def connect(self) -> None:
        """Initialize Kafka producer connection"""
        if not HAS_KAFKA:
            logger.warning("aiokafka not available, events will be logged only")
            self.is_connected = False
            return
        
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: v.encode('utf-8') if isinstance(v, str) else v
            )
            await self.producer.start()
            self.is_connected = True
            logger.info(f"Kafka producer connected to {self.bootstrap_servers}")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self.is_connected = False
    
    async def disconnect(self) -> None:
        """Close Kafka producer connection"""
        if self.producer and self.is_connected:
            try:
                await self.producer.stop()
                self.is_connected = False
                logger.info("Kafka producer disconnected")
            except Exception as e:
                logger.error(f"Error disconnecting Kafka producer: {e}")
    
    async def publish(
        self,
        event: Event,
        topic: Optional[str] = None
    ) -> bool:
        """
        Publish event to Kafka topic.
        
        Args:
            event: Event to publish
            topic: Kafka topic (defaults to event type)
        
        Returns:
            True if published successfully, False otherwise
        """
        topic = topic or event.type.value
        
        # If Kafka not available, log event only
        if not self.is_connected:
            logger.info(f"Event (no Kafka): {topic} - {event.to_json()}")
            return True
        
        # Retry logic
        for attempt in range(self.max_retries):
            try:
                await self.producer.send_and_wait(
                    topic,
                    event.to_bytes(),
                    key=event.correlation_id.encode('utf-8')
                )
                logger.debug(f"Event published to {topic}: {event.correlation_id}")
                return True
            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    wait_ms = self.retry_backoff_ms * (2 ** attempt)
                    logger.warning(
                        f"Failed to publish event (attempt {attempt + 1}), "
                        f"retrying in {wait_ms}ms: {e}"
                    )
                    await asyncio.sleep(wait_ms / 1000)
                else:
                    logger.error(
                        f"Failed to publish event after {self.max_retries} attempts: {e}"
                    )
                    return False
        
        return False
    
    async def publish_batch(
        self,
        events: list[Event]
    ) -> Dict[str, bool]:
        """
        Publish multiple events efficiently.
        
        Returns:
            Dict mapping correlation_id to success status
        """
        results = {}
        for event in events:
            success = await self.publish(event)
            results[event.correlation_id] = success
        return results


class EventFactory:
    """Factory for creating typed events"""
    
    @staticmethod
    def vehicle_entry(
        vehicle_id: str,
        zone_id: str,
        employee_id: str,
        timestamp: Optional[str] = None,
        **extra_data
    ) -> Event:
        """Create vehicle entry event"""
        return Event(
            EventType.VEHICLE_ENTRY,
            {
                "vehicle_id": vehicle_id,
                "zone_id": zone_id,
                "employee_id": employee_id,
                "timestamp": timestamp or datetime.utcnow().isoformat(),
                **extra_data
            }
        )
    
    @staticmethod
    def vehicle_exit(
        vehicle_id: str,
        zone_id: str,
        employee_id: str,
        timestamp: Optional[str] = None,
        **extra_data
    ) -> Event:
        """Create vehicle exit event"""
        return Event(
            EventType.VEHICLE_EXIT,
            {
                "vehicle_id": vehicle_id,
                "zone_id": zone_id,
                "employee_id": employee_id,
                "timestamp": timestamp or datetime.utcnow().isoformat(),
                **extra_data
            }
        )
    
    @staticmethod
    def vehicle_denied(
        vehicle_id: str,
        zone_id: str,
        reason: str,
        **extra_data
    ) -> Event:
        """Create access denied event"""
        return Event(
            EventType.VEHICLE_DENIED,
            {
                "vehicle_id": vehicle_id,
                "zone_id": zone_id,
                "reason": reason,
                "timestamp": datetime.utcnow().isoformat(),
                **extra_data
            }
        )
    
    @staticmethod
    def alert_created(
        alert_id: str,
        alert_type: str,
        severity: str,
        message: str,
        zone_id: Optional[str] = None,
        **extra_data
    ) -> Event:
        """Create alert created event"""
        return Event(
            EventType.ALERT_CREATED,
            {
                "alert_id": alert_id,
                "alert_type": alert_type,
                "severity": severity,
                "message": message,
                "zone_id": zone_id,
                "timestamp": datetime.utcnow().isoformat(),
                **extra_data
            }
        )
    
    @staticmethod
    def alert_escalated(
        alert_id: str,
        from_severity: str,
        to_severity: str,
        reason: str,
        **extra_data
    ) -> Event:
        """Create alert escalation event"""
        return Event(
            EventType.ALERT_ESCALATED,
            {
                "alert_id": alert_id,
                "from_severity": from_severity,
                "to_severity": to_severity,
                "reason": reason,
                "timestamp": datetime.utcnow().isoformat(),
                **extra_data
            }
        )
    
    @staticmethod
    def iot_heartbeat(
        device_id: str,
        device_type: str,
        zone_id: str,
        status: str = "online",
        **extra_data
    ) -> Event:
        """Create IoT device heartbeat event"""
        return Event(
            EventType.IOT_HEARTBEAT,
            {
                "device_id": device_id,
                "device_type": device_type,
                "zone_id": zone_id,
                "status": status,
                "timestamp": datetime.utcnow().isoformat(),
                **extra_data
            }
        )
    
    @staticmethod
    def report_completed(
        report_id: str,
        report_type: str,
        status: str,
        file_url: Optional[str] = None,
        **extra_data
    ) -> Event:
        """Create report completion event"""
        return Event(
            EventType.REPORT_COMPLETED,
            {
                "report_id": report_id,
                "report_type": report_type,
                "status": status,
                "file_url": file_url,
                "timestamp": datetime.utcnow().isoformat(),
                **extra_data
            }
        )


# Global event producer instance
_event_producer: Optional[EventProducer] = None


async def get_event_producer(
    bootstrap_servers: str = "localhost:9092",
    service_name: str = "vehitrack"
) -> EventProducer:
    """Get or create global event producer"""
    global _event_producer
    
    if _event_producer is None:
        _event_producer = EventProducer(
            bootstrap_servers=bootstrap_servers,
            service_name=service_name
        )
        await _event_producer.connect()
    
    return _event_producer


async def publish_event(event: Event) -> bool:
    """Convenience function to publish event"""
    producer = await get_event_producer()
    return await producer.publish(event)


# Convenience functions for common events
async def publish_vehicle_entry(
    vehicle_id: str,
    zone_id: str,
    employee_id: str
) -> bool:
    """Publish vehicle entry event"""
    event = EventFactory.vehicle_entry(vehicle_id, zone_id, employee_id)
    return await publish_event(event)


async def publish_vehicle_exit(
    vehicle_id: str,
    zone_id: str,
    employee_id: str
) -> bool:
    """Publish vehicle exit event"""
    event = EventFactory.vehicle_exit(vehicle_id, zone_id, employee_id)
    return await publish_event(event)


async def publish_alert_created(
    alert_id: str,
    alert_type: str,
    severity: str,
    message: str,
    zone_id: Optional[str] = None
) -> bool:
    """Publish alert created event"""
    event = EventFactory.alert_created(alert_id, alert_type, severity, message, zone_id)
    return await publish_event(event)
