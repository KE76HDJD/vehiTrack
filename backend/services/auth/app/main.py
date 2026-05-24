from fastapi import FastAPI
from backend.common.app.foundations import setup_app_foundations
from .api.v1.auth import router as auth_router
from .api.v1.employees import router as employees_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="VehiTrack Auth Service", 
        version="1.0.0",
        docs_url="/api/v1/auth/docs",
        openapi_url="/api/v1/auth/openapi.json"
    )
    
    # Standardize Foundations (CORS, Error Handlers)
    setup_app_foundations(app)
    
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(employees_router, prefix="/api/v1/employees", tags=["employees"])
    
    @app.get("/health")
    def health(): return {"status": "healthy", "service": "auth-service"}
    
    return app

app = create_app()
