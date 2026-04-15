from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Safe, FinancialTransaction
from app.schemas import ApiResponse, TransactionCreate # استخدام الـ Schemas الموحدة
from uuid import UUID

router = APIRouter(prefix="/accounting", tags=["Accounting"])

@router.post("/transaction", response_model=ApiResponse)
async def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    # 1. التأكد من وجود الخزنة (البحث بالـ UUID)
    safe = db.query(Safe).filter(Safe.id == data.id).first()
    if not safe:
        raise HTTPException(status_code=404, detail="Safe not found")

    # 2. تحديث رصيد الخزنة
    if data.type == "income":
        safe.balance += data.amount
    elif data.type == "expense":
        if safe.balance < data.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        safe.balance -= data.amount

    # 3. تسجيل العملية المالية (استخدام بيانات الـ Schema)
    transaction = FinancialTransaction(**data.model_dump())
    
    db.add(transaction)
    db.commit()
    return {"success": True, "message": "Transaction recorded", "data": {"new_balance": safe.balance}}

@router.get("/safes", response_model=ApiResponse)
async def get_all_safes(db: Session = Depends(get_db)):
    safes = db.query(Safe).all()
    return {"success": True, "message": "Safes retrieved", "data": safes}