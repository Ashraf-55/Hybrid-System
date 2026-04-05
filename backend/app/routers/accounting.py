from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Safe, FinancialTransaction, Visit
from pydantic import BaseModel
from datetime import datetime
from typing import List

router = APIRouter(prefix="/accounting", tags=["Accounting"])

# --- المخططات (Schemas) ---
class TransactionCreate(BaseModel):
    safe_id: int
    amount: float
    type: str # 'income' or 'expense'
    category: str # 'visit', 'salary', 'rent', 'inventory'
    description: str = ""

# --- العمليات (Endpoints) ---

@router.post("/transaction")
async def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    # 1. التأكد من وجود الخزنة
    safe = db.query(Safe).filter(Safe.id == data.safe_id).first()
    if not safe:
        raise HTTPException(status_code=404, detail="Safe not found")

    # 2. تحديث رصيد الخزنة بناءً على نوع العملية
    if data.type == "income":
        safe.balance += data.amount
    elif data.type == "expense":
        if safe.balance < data.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance in safe")
        safe.balance -= data.amount
    else:
        raise HTTPException(status_code=400, detail="Invalid transaction type")

    # 3. تسجيل العملية المالية
    transaction = FinancialTransaction(
        safe_id=data.safe_id,
        amount=data.amount,
        type=data.type,
        category=data.category,
        description=data.description
    )
    
    db.add(transaction)
    db.commit()
    return {"message": "Transaction recorded", "new_balance": safe.balance}

@router.get("/safes")
async def get_all_safes(db: Session = Depends(get_db)):
    # عرض كل الخزن والأرصدة الحالية (نقطة 3.7 في طلباتك)
    return db.query(Safe).all()

@router.get("/reports/cash-flow")
async def get_cash_flow(db: Session = Depends(get_db)):
    # تقرير سريع بالتدفق النقدي (نقطة 3.8)
    transactions = db.query(FinancialTransaction).all()
    total_income = sum(t.amount for t in transactions if t.type == 'income')
    total_expense = sum(t.amount for t in transactions if t.type == 'expense')
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_profit": total_income - total_expense
    }