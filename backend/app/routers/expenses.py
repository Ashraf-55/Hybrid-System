from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.expense import Expense
from typing import List

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("/")
def get_all_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).all()

@router.post("/")
def add_expense(title: str, amount: float, category: str, db: Session = Depends(get_db)):
    import uuid
    new_exp = Expense(id=str(uuid.uuid4()), title=title, amount=amount, category=category)
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp