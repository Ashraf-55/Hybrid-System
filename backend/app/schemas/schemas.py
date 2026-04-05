from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any

# --- 1. الرد الموحد (ApiResponse) ---
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)

# --- 2. بيانات المستخدمين (Users) - دي اللي كانت ناقصة وموقفة السيرفر ---
class UserBase(BaseModel):
    username: str
    full_name: str
    role: Optional[str] = "receptionist"

class UserCreate(UserBase):
    password: str  # بنحتاجه فقط عند التسجيل

class UserOut(UserBase):
    # البيانات اللي بترجع للمتصفح (بدون الباسورد طبعاً)
    model_config = ConfigDict(from_attributes=True)

# --- 3. بيانات المخزن (Inventory) ---
class ItemBase(BaseModel):
    name: str
    quantity: int
    min_stock_level: Optional[int] = 5
    unit_price: float
    category: Optional[str] = "General"

class ItemCreate(ItemBase):
    pass

class ItemOut(ItemBase):
    id: int
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)

# --- 4. بيانات المالية (Finance) ---
class TransactionCreate(BaseModel):
    type: str  # income or expense
    amount: float
    description: Optional[str] = None
    category: str

class TransactionOut(TransactionCreate):
    id: int
    date: datetime
    model_config = ConfigDict(from_attributes=True)

# --- 5. بيانات الزيارات (Visits) ---
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
    model_config = ConfigDict(from_attributes=True)

# --- 6. بيانات الموظفين (HR) ---
class EmployeeCreate(BaseModel):
    name: str
    role: str
    base_salary: float
    phone: Optional[str] = None

class EmployeeOut(EmployeeCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)