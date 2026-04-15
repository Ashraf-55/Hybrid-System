from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import FinancialTransaction, Safe
from app.schemas import ApiResponse, TransactionCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/finance", tags=["Finance"])

@router.post("/transaction", response_model=ApiResponse)
def add_transaction(data: TransactionCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    # دمج منطق الخزنة مع العملية
    new_tx = FinancialTransaction(**data.model_dump())
    db.add(new_tx)
    
    # تحديث رصيد الخزنة أوتوماتيكياً
    safe = db.query(Safe).filter(Safe.id == data.safe_id).first()
    if safe:
        if data.type == "income": safe.balance += data.amount
        else: safe.balance -= data.amount
        
    db.commit()
    db.refresh(new_tx)
    return {"success": True, "message": "تم تسجيل العملية وتحديث الخزنة", "data": new_tx}

@router.get("/summary", response_model=ApiResponse)
def get_finance_summary(db: Session = Depends(get_db)):
    income = db.query(func.sum(FinancialTransaction.amount)).filter(FinancialTransaction.type == "income").scalar() or 0
    expenses = db.query(func.sum(FinancialTransaction.amount)).filter(FinancialTransaction.type == "expense").scalar() or 0
    return {
        "success": True,
        "message": "تقرير مالي شامل",
        "data": {"income": income, "expenses": expenses, "net": income - expenses}
    }