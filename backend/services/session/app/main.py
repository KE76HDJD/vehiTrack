from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.sessions import router as sessions_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Session Service", 
        version="1.0.0",
        docs_url="/api/v1/sessions/docs",
        openapi_url="/api/v1/sessions/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(sessions_router, prefix="/api/v1/sessions", tags=["sessions"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "session-service"}
    
    return app

app = create_app()
