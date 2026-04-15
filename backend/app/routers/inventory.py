from fastapi import APIRouter, Depends, HTTPException # ضيف APIRouter هنا
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import InventoryItem
from app.dependencies import get_current_user
from app.schemas import ApiResponse, ItemCreate

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=ApiResponse)
def get_inventory(db: Session = Depends(get_db), current=Depends(get_current_user)):
    # جلب مخزون العيادة الحالية فقط
    items = db.query(InventoryItem).filter(InventoryItem.clinic_id == current.clinic_id).all()
    return {"success": True, "message": "تم جلب مخزن العيادة", "data": items}

@router.post("/add", response_model=ApiResponse)
def add_item(item: ItemCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    # ربط الصنف بالعيادة
    new_item = InventoryItem(**item.model_dump(), clinic_id=current.clinic_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"success": True, "message": "تم إضافة الصنف للمخزن", "data": new_item}