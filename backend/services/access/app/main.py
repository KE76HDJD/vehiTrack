from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../common"))

from app.config import settings
from .api.v1.vehicles import router as vehicles_router
from .api.v1.sessions import router as sessions_router
from .api.v1.access_rights import router as access_rights_router

def create_app() -> FastAPI:
    app = FastAPI(title="VehiTrack Access Service", version="1.0.0")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(vehicles_router, prefix="/api/v1/vehicles", tags=["vehicles"])
    app.include_router(sessions_router, prefix="/api/v1/sessions", tags=["sessions"])
    app.include_router(access_rights_router, prefix="/api/v1/access-rights", tags=["access-rights"])

    @app.get("/health")
    def health():
        return {"status": "healthy", "service": "access-service"}

    return app

app = create_app()
