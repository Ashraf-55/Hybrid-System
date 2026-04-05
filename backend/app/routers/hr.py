from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hr import Employee
from app.schemas import ApiResponse, EmployeeCreate

router = APIRouter(prefix="/hr", tags=["HR & Payroll"])

@router.post("/employees", response_model=ApiResponse)
def add_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    new_emp = Employee(**emp.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return {"success": True, "message": "تم إضافة الموظف بنجاح", "data": new_emp}

@router.get("/employees", response_model=ApiResponse)
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    return {"success": True, "message": "قائمة الموظفين", "data": employees}