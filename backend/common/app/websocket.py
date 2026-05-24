"""
WebSocket Connection Manager for Real-Time Updates

Handles:
- Multi-client broadcasting
- Message types: session.entry, session.exit, alert.new, slot.update
- Automatic reconnection handling
- Connection lifecycle management
"""

import asyncio
import json
from datetime import datetime
from typing import Set, Dict, Any, Optional
from enum import Enum

from fastapi import WebSocket, WebSocketDisconnect
import logging

logger = logging.getLogger(__name__)


class MessageType(str, Enum):
    """WebSocket message types for real-time events"""
    SESSION_ENTRY = "session.entry"
    SESSION_EXIT = "session.exit"
    ALERT_NEW = "alert.new"
    ALERT_ACKNOWLEDGED = "alert.acknowledged"
    ALERT_ESCALATED = "alert.escalated"
    SLOT_UPDATE = "slot.update"
    AVAILABILITY_CHANGE = "availability.change"
    VEHICLE_STATUS = "vehicle.status"
    HEARTBEAT = "heartbeat"
    ERROR = "error"


class WSMessage:
    """WebSocket message wrapper with timestamp and metadata"""
    
    def __init__(
        self,
        message_type: MessageType,
        data: Dict[str, Any],
        user_id: Optional[str] = None,
        zone_id: Optional[str] = None
    ):
        self.type = message_type
        self.data = data
        self.user_id = user_id
        self.zone_id = zone_id
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_json(self) -> str:
        """Convert message to JSON string for WebSocket transmission"""
        return json.dumps({
            "type": self.type.value,
            "data": self.data,
            "timestamp": self.timestamp,
            "user_id": self.user_id,
            "zone_id": self.zone_id
        })
    
    @classmethod
    def from_json(cls, json_str: str) -> "WSMessage":
        """Parse JSON string to WSMessage"""
        data = json.loads(json_str)
        return cls(
            message_type=MessageType(data["type"]),
            data=data.get("data", {}),
            user_id=data.get("user_id"),
            zone_id=data.get("zone_id")
        )


class ConnectionManager:
    """
    Manages WebSocket connections for real-time updates.
    
    Supports:
    - Per-zone subscriptions (garage staff sees only their zone)
    - Admin broadcast (admins see all events)
    - Topic-based filtering (only relevant messages)
    """
    
    def __init__(self):
        # Active connections: {zone_id: {user_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # User subscriptions: {user_id: {zone_ids: set, roles: set}}
        self.user_subscriptions: Dict[str, Dict[str, Any]] = {}
        # Lock for thread-safe operations
        self.lock = asyncio.Lock()
    
    async def connect(
        self,
        websocket: WebSocket,
        user_id: str,
        zone_id: str,
        roles: list[str]
    ) -> None:
        """Register a new WebSocket connection"""
        await websocket.accept()
        
        async with self.lock:
            # Add to zone connections
            if zone_id not in self.active_connections:
                self.active_connections[zone_id] = {}
            
            self.active_connections[zone_id][user_id] = websocket
            
            # Track user subscription
            self.user_subscriptions[user_id] = {
                "zone_id": zone_id,
                "roles": roles,
                "connected_at": datetime.utcnow().isoformat()
            }
        
        logger.info(
            f"WebSocket connected: user={user_id}, zone={zone_id}, roles={roles}"
        )
        
        # Send connection confirmation
        await websocket.send_text(
            WSMessage(
                MessageType.HEARTBEAT,
                {"status": "connected", "user_id": user_id},
                user_id=user_id,
                zone_id=zone_id
            ).to_json()
        )
    
    async def disconnect(self, user_id: str, zone_id: str) -> None:
        """Unregister a WebSocket connection"""
        async with self.lock:
            if zone_id in self.active_connections:
                if user_id in self.active_connections[zone_id]:
                    del self.active_connections[zone_id][user_id]
                
                # Clean up empty zone dict
                if not self.active_connections[zone_id]:
                    del self.active_connections[zone_id]
            
            if user_id in self.user_subscriptions:
                del self.user_subscriptions[user_id]
        
        logger.info(f"WebSocket disconnected: user={user_id}, zone={zone_id}")
    
    async def broadcast_to_zone(
        self,
        message: WSMessage,
        zone_id: str
    ) -> None:
        """Broadcast message to all connected users in a zone"""
        async with self.lock:
            if zone_id not in self.active_connections:
                return
            
            dead_connections = []
            
            for user_id, websocket in self.active_connections[zone_id].items():
                try:
                    await websocket.send_text(message.to_json())
                except Exception as e:
                    logger.error(
                        f"Error sending to {user_id} in zone {zone_id}: {e}"
                    )
                    dead_connections.append(user_id)
            
            # Remove dead connections
            for user_id in dead_connections:
                del self.active_connections[zone_id][user_id]
    
    async def broadcast_to_admins(
        self,
        message: WSMessage
    ) -> None:
        """Broadcast message to all connected admin users"""
        async with self.lock:
            dead_connections = []
            
            for zone_id, zone_users in self.active_connections.items():
                for user_id, websocket in zone_users.items():
                    subscription = self.user_subscriptions.get(user_id, {})
                    
                    # Only send to admins
                    if "admin" in subscription.get("roles", []):
                        try:
                            await websocket.send_text(message.to_json())
                        except Exception as e:
                            logger.error(f"Error sending to admin {user_id}: {e}")
                            dead_connections.append((zone_id, user_id))
            
            # Remove dead connections
            for zone_id, user_id in dead_connections:
                if zone_id in self.active_connections:
                    if user_id in self.active_connections[zone_id]:
                        del self.active_connections[zone_id][user_id]
    
    async def send_to_user(
        self,
        message: WSMessage,
        user_id: str
    ) -> bool:
        """Send message to specific user if connected"""
        async with self.lock:
            subscription = self.user_subscriptions.get(user_id)
            
            if not subscription:
                return False
            
            zone_id = subscription["zone_id"]
            
            if zone_id not in self.active_connections:
                return False
            
            if user_id not in self.active_connections[zone_id]:
                return False
            
            websocket = self.active_connections[zone_id][user_id]
            
            try:
                await websocket.send_text(message.to_json())
                return True
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                del self.active_connections[zone_id][user_id]
                return False
    
    def get_active_connections_count(self) -> int:
        """Get total number of active connections"""
        return sum(
            len(users) for users in self.active_connections.values()
        )
    
    def get_zone_connections_count(self, zone_id: str) -> int:
        """Get number of connections in specific zone"""
        return len(self.active_connections.get(zone_id, {}))


# Global connection manager instance
manager = ConnectionManager()


async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    zone_id: str,
    roles: list[str]
) -> None:
    """
    WebSocket endpoint handler.
    
    Usage in FastAPI route:
        @app.websocket("/api/v1/iot/ws/live")
        async def websocket_endpoint(websocket: WebSocket, user_id: str, zone_id: str, roles: list[str]):
            await websocket.accept()
            await manager.connect(websocket, user_id, zone_id, roles)
            try:
                while True:
                    data = await websocket.receive_text()
                    # Handle incoming client messages if needed
            except WebSocketDisconnect:
                await manager.disconnect(user_id, zone_id)
    """
    await manager.connect(websocket, user_id, zone_id, roles)
    
    try:
        while True:
            # Keep connection alive, receive ping/pong
            data = await websocket.receive_text()
            # Optional: echo back for heartbeat confirmation
            await websocket.send_text(
                WSMessage(
                    MessageType.HEARTBEAT,
                    {"status": "pong"},
                    user_id=user_id,
                    zone_id=zone_id
                ).to_json()
            )
    except WebSocketDisconnect:
        await manager.disconnect(user_id, zone_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        await manager.disconnect(user_id, zone_id)
