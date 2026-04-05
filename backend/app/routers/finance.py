from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.finance import Transaction
from app.dependencies import get_current_user
from app.schemas import ApiResponse, TransactionCreate

router = APIRouter(prefix="/finance", tags=["Finance"])

@router.post("/add", response_model=ApiResponse)
def add_transaction(item: TransactionCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    new_tx = Transaction(**item.dict())
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return {"success": True, "message": "تم تسجيل العملية المالية بنجاح", "data": new_tx}

@router.get("/summary", response_model=ApiResponse)
def get_finance_summary(db: Session = Depends(get_db), current=Depends(get_current_user)):
    # حساب إجمالي الدخل والمصاريف
    income = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "income").scalar() or 0
    expenses = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "expense").scalar() or 0
    
    return {
        "success": True,
        "message": "تم جلب التقرير المالي",
        "data": {
            "total_income": income,
            "total_expenses": expenses,
            "balance": income - expenses
        }
    }