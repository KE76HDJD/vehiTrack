from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.iot import router as iot_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack IoT Bridge Service", 
        version="1.0.0",
        docs_url="/api/v1/iot/docs",
        openapi_url="/api/v1/iot/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(iot_router, prefix="/api/v1/iot", tags=["iot"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "iot-bridge-service"}
    
    return app

app = create_app()
