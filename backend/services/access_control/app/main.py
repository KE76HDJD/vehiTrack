from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.access_rights import router as access_rights_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Access Control Service", 
        version="1.0.0",
        docs_url="/api/v1/access-control/docs",
        openapi_url="/api/v1/access-control/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(access_rights_router, prefix="/api/v1/access-rights", tags=["access-control"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "access-control-service"}
    
    return app

app = create_app()
