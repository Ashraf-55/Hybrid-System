from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inventory import InventoryItem # تأكد من وجود الموديل ده عندك
from app.dependencies import get_current_user
from app.schemas import ApiResponse, ItemCreate

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=ApiResponse)
def get_inventory(db: Session = Depends(get_db), current=Depends(get_current_user)):
    items = db.query(InventoryItem).all()
    return {
        "success": True,
        "message": "تم جلب بيانات المخزن",
        "data": items
    }

@router.post("/add", response_model=ApiResponse)
def add_item(item: ItemCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    new_item = InventoryItem(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {
        "success": True,
        "message": "تم إضافة الصنف بنجاح",
        "data": new_item
    }