from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .exceptions import (
    VehicleNotFound, ReservationConflict, OCRFailure,
    UnauthorizedAccess, SessionAlreadyActive, SlotUnavailable,
    VehiTrackException
)
from .config import settings
import os

# Mapping of exception classes to (status_code, error_code)
EXCEPTION_MAP = {
    VehicleNotFound:      (404, "VEHICLE_NOT_FOUND"),
    ReservationConflict:  (409, "RESERVATION_CONFLICT"),
    OCRFailure:           (422, "OCR_PROCESSING_FAILED"),
    UnauthorizedAccess:   (403, "ACCESS_DENIED"),
    SessionAlreadyActive: (409, "SESSION_ALREADY_ACTIVE"),
    SlotUnavailable:      (409, "SLOT_UNAVAILABLE"),
}

def setup_app_foundations(app: FastAPI):
    """Configure CORS and standard error handlers for a FastAPI app."""
    
    # Standard CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS.split(","),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Total-Count", "X-Request-ID"],
    )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Handle custom VehiTrack exceptions
        for exc_class, (status_code, error_code) in EXCEPTION_MAP.items():
            if isinstance(exc, exc_class):
                return JSONResponse(
                    status_code=status_code,
                    content={
                        "success": False,
                        "error_code": error_code,
                        "message": str(exc.detail) if hasattr(exc, "detail") else str(exc),
                        "path": str(request.url),
                    }
                )
        
        # Handle generic VehiTrackException if not in map
        if isinstance(exc, VehiTrackException):
             return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "error_code": "GENERAL_ERROR",
                    "message": exc.detail,
                    "path": str(request.url),
                }
            )

        # Unhandled exceptions -> 500
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "Une erreur inattendue s'est produite.",
                "path": str(request.url),
            }
        )
