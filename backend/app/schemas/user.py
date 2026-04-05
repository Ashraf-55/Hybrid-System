from pydantic import BaseModel, EmailStr
from typing import Optional

# البيانات المشتركة بين كل العمليات
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: Optional[str] = "receptionist"

# البيانات المطلوبة عند إنشاء مستخدم جديد (Registration)
class UserCreate(UserBase):
    password: str

# شكل البيانات اللي هترجع للفرونت إند (Response)
# مش بنرجع الباسورد طبعاً للأمان
class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True