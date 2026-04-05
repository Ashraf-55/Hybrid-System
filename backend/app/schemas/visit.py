from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class VisitBase(BaseModel):
    patient_id: str
    doctor_id: int
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    total_fees: float

class VisitCreate(VisitBase):
    id: str

class VisitOut(VisitBase):
    id: str
    doctor_share: float
    visit_date: datetime

    class Config:
        from_attributes = True