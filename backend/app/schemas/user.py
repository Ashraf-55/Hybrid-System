from pydantic import EmailStr
from typing import Optional
from .base_sync import SyncBaseSchema

class UserBase(SyncBaseSchema):
    username: str
    email: EmailStr
    full_name: str
    role: Optional[str] = "receptionist"

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    is_active: bool