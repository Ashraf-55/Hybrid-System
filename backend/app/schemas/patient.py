from datetime import datetime # <--- تعديل هنا
from typing import Optional
from .base_sync import SyncBaseSchema

class PatientBase(SyncBaseSchema):
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    chronic_diseases: Optional[str] = None

class PatientCreate(PatientBase):
    pass 

class PatientOut(PatientBase):
    loyalty_points: int = 0
    created_at: Optional[datetime] = None # كدة كلمة datetime بقت معرفة صح