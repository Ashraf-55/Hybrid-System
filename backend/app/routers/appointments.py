from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appointment, Patient, User
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# --- المخططات (Schemas) ---
class AppointmentCreate(BaseModel):
    id: str # سنستخدم UUID أو رقم مميز من الفرونت
    patient_id: str
    doctor_id: int
    appointment_date: datetime
    duration_minutes: int = 30 # مدة الكشف الافتراضية

# --- العمليات (Endpoints) ---

@router.post("/book")
async def book_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    # 1. التأكد من وجود المريض والدكتور
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    doctor = db.query(User).filter(User.id == data.doctor_id, User.role == "doctor").first()
    
    if not patient or not doctor:
        raise HTTPException(status_code=404, detail="Patient or Doctor not found")

    # 2. منطق منع التعارض (Conflict Detection) - نقطة 2.3 في طلباتك
    # بنشوف هل الدكتور عنده موعد تاني في نفس الفترة الزمنية؟
    start_time = data.appointment_date
    end_time = start_time + timedelta(minutes=data.duration_minutes)

    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.status == "confirmed",
        Appointment.appointment_date >= (start_time - timedelta(minutes=data.duration_minutes)),
        Appointment.appointment_date < end_time
    ).first()

    if conflict:
        raise HTTPException(
            status_code=400, 
            detail=f"Doctor is busy at this time. Conflict with appointment at {conflict.appointment_date}"
        )

    # 3. تسجيل الموعد
    new_app = Appointment(
        id=data.id,
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        status="confirmed"
    )
    
    db.add(new_app)
    db.commit()
    return {"message": "Appointment booked successfully", "time": start_time}

@router.get("/daily-dashboard/{doctor_id}")
async def get_doctor_schedule(doctor_id: int, db: Session = Depends(get_db)):
    # لوحة تحكم يومية للدكتور (نقطة 2.4)
    today = datetime.utcnow().date()
    schedule = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date >= today
    ).order_by(Appointment.appointment_date).all()
    
    return schedule