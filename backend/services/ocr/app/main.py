from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.ocr import router as ocr_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack OCR Service", 
        version="1.0.0",
        docs_url="/api/v1/ocr/docs",
        openapi_url="/api/v1/ocr/openapi.json"
    )
    
    # Standardize Foundations
    setup_app_foundations(app)
    
    app.include_router(ocr_router, prefix="/api/v1/ocr", tags=["ocr"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "ocr-service"}
    
    return app

app = create_app()
