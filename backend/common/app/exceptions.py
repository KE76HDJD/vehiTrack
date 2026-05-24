"""Custom HTTP Exceptions for VehiTrack Pro."""

from fastapi import HTTPException, status
from typing import Any, Optional


class VehiTrackException(HTTPException):
    """Base VehiTrack exception."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[dict] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundError(VehiTrackException):
    """404 Not Found exception."""

    def __init__(self, detail: str = "Resource not found", headers: Optional[dict] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND, detail=detail, headers=headers
        )


class UnauthorizedError(VehiTrackException):
    """401 Unauthorized exception."""

    def __init__(
        self,
        detail: str = "Not authenticated",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers=headers
        )


class ForbiddenError(VehiTrackException):
    """403 Forbidden exception."""

    def __init__(
        self,
        detail: str = "Permission denied",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN, detail=detail, headers=headers
        )


class ValidationError(VehiTrackException):
    """422 Unprocessable Entity exception."""

    def __init__(
        self,
        detail: str = "Validation error",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            headers=headers,
        )


class ConflictError(VehiTrackException):
    """409 Conflict exception."""

    def __init__(
        self,
        detail: str = "Resource conflict",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT, detail=detail, headers=headers
        )


class RateLimitExceeded(VehiTrackException):
    """429 Too Many Requests exception."""

    def __init__(
        self,
        detail: str = "Rate limit exceeded",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers=headers,
        )


class InternalServerError(VehiTrackException):
    """500 Internal Server Error exception."""

    def __init__(
        self,
        detail: str = "Internal server error",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            headers=headers,
        )


class BadRequestError(VehiTrackException):
    """400 Bad Request exception."""

    def __init__(
        self,
        detail: str = "Bad request",
        headers: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST, detail=detail, headers=headers
        )


# Service-specific exceptions


class VehicleNotFound(NotFoundError):
    """Vehicle not found."""

    def __init__(self):
        super().__init__(detail="Vehicle not found")


class EmployeeNotFound(NotFoundError):
    """Employee not found."""

    def __init__(self):
        super().__init__(detail="Employee not found")


class SessionNotFound(NotFoundError):
    """Session not found."""

    def __init__(self):
        super().__init__(detail="Session not found")


class UnauthorizedAccess(ForbiddenError):
    """Unauthorized vehicle access."""

    def __init__(self, reason: str = ""):
        detail = "Access denied"
        if reason:
            detail += f": {reason}"
        super().__init__(detail=detail)


class DuplicateEmployee(ConflictError):
    """Duplicate employee email."""

    def __init__(self):
        super().__init__(detail="Employee with this email already exists")


class InvalidCredentials(UnauthorizedError):
    """Invalid login credentials."""

    def __init__(self):
        super().__init__(detail="Invalid email or password")


class SessionAlreadyActive(ConflictError):
    """Vehicle already has active session."""

    def __init__(self):
        super().__init__(detail="Vehicle already has an active session")


class ReservationConflict(ConflictError):
    """Reservation time slot conflict."""

    def __init__(self):
        super().__init__(detail="Time slot conflicts with existing reservation")


class OCRFailure(ValidationError):
    """OCR processing failed."""

    def __init__(self, confidence: float = 0.0):
        detail = f"OCR confidence too low ({confidence:.2%}). Manual review required."
        super().__init__(detail=detail)


class ServiceUnavailable(InternalServerError):
    """Service temporarily unavailable."""

    def __init__(self, service: str = ""):
        detail = "Service temporarily unavailable"
        if service:
            detail += f" ({service})"
        super().__init__(detail=detail)


class SlotUnavailable(ConflictError):
    """Parking slot is not available for reservation."""

    def __init__(self, slot_id: str = ""):
        detail = "Parking slot is not available"
        if slot_id:
            detail += f" ({slot_id})"
        super().__init__(detail=detail)
