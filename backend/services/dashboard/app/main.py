from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from backend.common.app.foundations import setup_app_foundations
from .api.v1.dashboard import router as dashboard_router
from typing import List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Dashboard Aggregator", 
        version="1.0.0",
        docs_url="/api/v1/dashboard/docs",
        openapi_url="/api/v1/dashboard/openapi.json"
    )
    
    # Standardize Foundations
    setup_app_foundations(app)
    
    app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "dashboard-aggregator"}
    
    @app.websocket("/ws/monitoring")
    async def websocket_endpoint(websocket: WebSocket):
        await manager.connect(websocket)
        try:
            while True:
                # In production, this would be a consumer of Kafka/Redis
                # Here we just keep the connection alive
                data = await websocket.receive_text()
                await manager.broadcast(f"Echo: {data}")
        except WebSocketDisconnect:
            manager.disconnect(websocket)
            
    return app

app = create_app()
