from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GateSessionBase(BaseModel):
    plate_number: str
    plate_image_url: Optional[str] = None
    ocr_confidence: Optional[str] = None
    ocr_raw_text: Optional[str] = None

class GateSessionCreate(GateSessionBase):
    pass

class GateSessionOut(GateSessionBase):
    session_id: str
    entry_time: datetime
    exit_time: Optional[datetime] = None

    class Config:
        from_attributes = True

SessionOut = GateSessionOut
