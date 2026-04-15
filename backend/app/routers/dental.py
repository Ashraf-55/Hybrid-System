from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dental import DentalChart
from app.models.patient import Patient
from app.schemas import ApiResponse # استيراد الرد الموحد
from pydantic import BaseModel
from typing import List
from uuid import UUID

router = APIRouter(prefix="/dental", tags=["Dental Chart"])

# Schema داخلية للمدخلات فقط
class ToothUpdate(BaseModel):
    tooth_number: int
    condition: str
    notes: str = ""

@router.post("/{patient_id}/update-tooth", response_model=ApiResponse)
async def update_tooth_status(patient_id: UUID, data: ToothUpdate, db: Session = Depends(get_db)):
    db_tooth = db.query(DentalChart).filter(
        DentalChart.patient_id == patient_id, 
        DentalChart.tooth_number == data.tooth_number
    ).first()

    if db_tooth:
        for key, value in data.model_dump().items():
            setattr(db_tooth, key, value)
    else:
        new_tooth = DentalChart(patient_id=patient_id, **data.model_dump())
        db.add(new_tooth)
    
    db.commit()
    return {"success": True, "message": "Tooth updated", "data": None}

@router.get("/{patient_id}/chart", response_model=ApiResponse)
async def get_patient_chart(patient_id: str, db: Session = Depends(get_db)):
    chart = db.query(DentalChart).filter(DentalChart.patient_id == patient_id).all()
    return {"success": True, "message": "تم جلب مخطط الأسنان", "data": chart}