from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.analytics import router as analytics_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Analytics Service", 
        version="1.0.0",
        docs_url="/api/v1/analytics/docs",
        openapi_url="/api/v1/analytics/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["analytics"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "analytics-service"}
    
    return app

app = create_app()
