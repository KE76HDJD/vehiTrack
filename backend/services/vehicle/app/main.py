from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.vehicles import router as vehicles_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Vehicle Service", 
        version="1.0.0",
        docs_url="/api/v1/vehicles/docs",
        openapi_url="/api/v1/vehicles/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(vehicles_router, prefix="/api/v1/vehicles", tags=["vehicles"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "vehicle-service"}
    
    return app

app = create_app()
