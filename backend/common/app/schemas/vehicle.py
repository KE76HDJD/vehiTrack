from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
import re

# ─── Regex officielle DTRF Togolaise — 3 formats ──────────────────────────────
# 1234-AB     → Particulier, moto, VIP
# TGA-1234    → Véhicule d'État (série simple)
# TGAA-1234   → Véhicule d'État (double série)
# 12-CD-34    → Corps diplomatique
TOGOLESE_PLATE_REGEX = re.compile(
    r"^(\d{4}-[A-Z]{2}|TG[A-Z]{1,2}-\d{4}|\d{2}-CD-\d{2})$"
)

VEHICLE_TYPES = {"car", "motorcycle", "truck", "van", "vip", "emergency"}


class VehicleBase(BaseModel):
    plate_number:  str
    plate_country: str = "TG"
    vehicle_type:  str
    brand:         Optional[str] = None
    model:         Optional[str] = None
    color:         Optional[str] = None

    @field_validator("plate_number")
    @classmethod
    def validate_togolese_plate(cls, v: str) -> str:
        """
        Valide le format officiel de la plaque d'immatriculation togolaise (DTRF).

        Formats acceptés :
          - Particulier / Moto / VIP  : 1234-AB
          - Commercial (van/truck)    : 1234-CB, 1234-TC, etc.
          - État / Administration     : TGA-1234 ou TGAA-1234
          - Corps diplomatique        : 12-CD-34
        """
        normalized = v.strip().upper()
        if not TOGOLESE_PLATE_REGEX.match(normalized):
            raise ValueError(
                f"Format de plaque invalide : '{v}'. "
                f"Formats togolais acceptés (DTRF) : "
                f"1234-AB | TGA-1234 | TGAA-1234 | 12-CD-34"
            )
        return normalized

    @field_validator("vehicle_type")
    @classmethod
    def validate_vehicle_type(cls, v: str) -> str:
        if v not in VEHICLE_TYPES:
            raise ValueError(f"Type invalide : {v}. Valeurs : {VEHICLE_TYPES}")
        return v


class VehicleCreate(VehicleBase):
    owner_id: UUID


class VehicleUpdate(BaseModel):
    plate_number:  Optional[str] = None
    vehicle_type:  Optional[str] = None
    brand:         Optional[str] = None
    model:         Optional[str] = None
    color:         Optional[str] = None
    is_active:     Optional[bool] = None

    @field_validator("plate_number")
    @classmethod
    def validate_plate_on_update(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        normalized = v.strip().upper()
        if not TOGOLESE_PLATE_REGEX.match(normalized):
            raise ValueError(
                f"Format de plaque invalide : '{v}'. "
                f"Formats togolais acceptés : 1234-AB | TGA-1234 | TGAA-1234 | 12-CD-34"
            )
        return normalized


class VehicleOut(VehicleBase):
    vehicle_id:   UUID
    owner_id:     UUID
    is_active:    bool
    created_at:   datetime

    model_config = ConfigDict(from_attributes=True)


class PlateLookupResponse(BaseModel):
    """Réponse du endpoint GET /api/v1/vehicles/lookup/{plate}"""
    found:        bool
    plate_number: str
    similarity:   Optional[float] = None   # score trigramme PostgreSQL pg_trgm
    vehicle:      Optional[VehicleOut] = None
    format_valid: bool                     # validation DTRF côté serveur

    @field_validator("plate_number")
    @classmethod
    def normalize_plate(cls, v: str) -> str:
        return v.strip().upper()
