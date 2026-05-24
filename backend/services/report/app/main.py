from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.reports import router as reports_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Report Service", 
        version="1.0.0",
        docs_url="/api/v1/reports/docs",
        openapi_url="/api/v1/reports/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(reports_router, prefix="/api/v1/reports", tags=["reports"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "report-service"}
    
    return app

app = create_app()
