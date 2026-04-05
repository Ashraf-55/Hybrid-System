from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PatientBase(BaseModel):
    name: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    chronic_diseases: Optional[str] = None

class PatientCreate(PatientBase):
    id: str

class PatientOut(PatientBase):
    id: str
    loyalty_points: int
    created_at: datetime

    class Config:
        from_attributes = True