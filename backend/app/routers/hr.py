from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Employee  # تأكد من استيراده من المجلد الرئيسي للموديلات
from app.schemas import ApiResponse, EmployeeCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/hr", tags=["HR & Payroll"])

@router.post("/employees", response_model=ApiResponse)
def add_employee(emp: EmployeeCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    # إضافة الـ clinic_id يدويًا لأن الـ Schema مش بتبعت عيادة
    new_emp = Employee(**emp.model_dump(), clinic_id=current.clinic_id)
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return {"success": True, "message": "تم إضافة الموظف بنجاح", "data": new_emp}

@router.get("/employees", response_model=ApiResponse)
def list_employees(db: Session = Depends(get_db), current=Depends(get_current_user)):
    # فلترة الموظفين حسب العيادة فقط
    employees = db.query(Employee).filter(Employee.clinic_id == current.clinic_id).all()
    return {"success": True, "message": "قائمة موظفي العيادة", "data": employees}