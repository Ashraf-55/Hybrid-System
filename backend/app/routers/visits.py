from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.visit import Visit
from app.models.patient import Patient
from app.schemas.visit import VisitCreate, VisitOut # هنكريت الشيكما دي حالا
from typing import List

router = APIRouter(prefix="/visits", tags=["Visits"])

@router.post("/", response_model=VisitOut)
def create_visit(visit: VisitCreate, db: Session = Depends(get_db)):
    # 1. التأكد من وجود المريض
    db_patient = db.query(Patient).filter(Patient.id == visit.patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2. حساب نصيب الدكتور (نفترض 70% مثلاً)
    doc_share = visit.total_fees * 0.7
    
    # 3. إنشاء سجل الزيارة
    new_visit = Visit(
        id=visit.id,
        patient_id=visit.patient_id,
        doctor_id=visit.doctor_id,
        diagnosis=visit.diagnosis,
        prescription=visit.prescription,
        total_fees=visit.total_fees,
        doctor_share=doc_share
    )
    
    # 4. تحديث نقاط الولاء للمريض (Loyalty Points)
    db_patient.loyalty_points += 1
    
    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)
    return new_visit

@router.get("/", response_model=List[VisitOut])
def get_all_visits(db: Session = Depends(get_db)):
    return db.query(Visit).all()