from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.notifications import router as notifications_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Notification Service", 
        version="1.0.0",
        docs_url="/api/v1/notifications/docs",
        openapi_url="/api/v1/notifications/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "notification-service"}
    
    return app

app = create_app()
