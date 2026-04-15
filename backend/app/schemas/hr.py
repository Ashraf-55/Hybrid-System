from typing import Optional
from .base_sync import SyncBaseSchema

class EmployeeBase(SyncBaseSchema):
    name: str
    role: str
    base_salary: float
    phone: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeOut(EmployeeBase):
    pass