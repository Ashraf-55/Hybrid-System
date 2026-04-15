from typing import Optional
from uuid import UUID
from .base_sync import SyncBaseSchema
from datetime import datetime

class VisitBase(SyncBaseSchema):
    patient_id: UUID # لازم UUID عشان يربط مع الـ Patient الجديد
    doctor_id: UUID  # لازم UUID عشان يربط مع الـ User الجديد
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    total_fees: float

class VisitCreate(VisitBase):
    pass

class VisitOut(VisitBase):
    doctor_share: float
    visit_date: datetime