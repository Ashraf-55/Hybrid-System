from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Expense
from app.dependencies import get_current_user
from app.schemas import ApiResponse, ExpenseCreate # دلوقتى هتشتغل صح
from uuid import UUID

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("/", response_model=ApiResponse)
def get_expenses(db: Session = Depends(get_db), current=Depends(get_current_user)):
    # بنجيب مصاريف العيادة الحالية بس
    items = db.query(Expense).filter(Expense.clinic_id == current.clinic_id).all()
    return {"success": True, "message": "قائمة المصاريف", "data": items}

@router.post("/", response_model=ApiResponse)
def add_expense(exp: ExpenseCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    # بنستخدم الـ model_dump() وبنحقن الـ clinic_id أوتوماتيك
    new_exp = Expense(**exp.model_dump(), clinic_id=current.clinic_id)
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return {"success": True, "message": "تم تسجيل المصروف", "data": new_exp}