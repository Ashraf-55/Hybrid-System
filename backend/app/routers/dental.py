from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dental import DentalChart
from app.models.patient import Patient
from app.schemas import ApiResponse # استيراد الرد الموحد
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/dental", tags=["Dental Chart"])

# Schema داخلية للمدخلات فقط
class ToothUpdate(BaseModel):
    tooth_number: int
    condition: str
    notes: str = ""

@router.post("/{patient_id}/update-tooth", response_model=ApiResponse)
async def update_tooth_status(patient_id: str, data: ToothUpdate, db: Session = Depends(get_db)):
    # 1. التأكد إن المريض موجود
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="المريض غير موجود")

    # 2. البحث عن سجل السنة
    db_tooth = db.query(DentalChart).filter(
        DentalChart.patient_id == patient_id, 
        DentalChart.tooth_number == data.tooth_number
    ).first()

    if db_tooth:
        db_tooth.condition = data.condition
        db_tooth.notes = data.notes
    else:
        new_tooth = DentalChart(
            patient_id=patient_id,
            tooth_number=data.tooth_number,
            condition=data.condition,
            notes=data.notes
        )
        db.add(new_tooth)
    
    db.commit()
    return {"success": True, "message": f"تم تحديث بيانات السنة رقم {data.tooth_number} بنجاح", "data": None}

@router.get("/{patient_id}/chart", response_model=ApiResponse)
async def get_patient_chart(patient_id: str, db: Session = Depends(get_db)):
    chart = db.query(DentalChart).filter(DentalChart.patient_id == patient_id).all()
    return {"success": True, "message": "تم جلب مخطط الأسنان", "data": chart}