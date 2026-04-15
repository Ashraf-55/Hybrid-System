from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appointment, Patient, User
from app.schemas import ApiResponse, VisitCreate # نستخدم Schema مناسبة للموعد
from datetime import datetime, timedelta

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/book", response_model=ApiResponse)
async def book_appointment(data: VisitCreate, db: Session = Depends(get_db)):
    # منطق منع التعارض
    start_time = data.visit_date
    end_time = start_time + timedelta(minutes=30)

    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.status == "confirmed",
        Appointment.appointment_date >= (start_time - timedelta(minutes=30)),
        Appointment.appointment_date < end_time
    ).first()

    if conflict:
        raise HTTPException(status_code=400, detail="Doctor is busy at this time")

    new_app = Appointment(**data.model_dump())
    db.add(new_app)
    db.commit()
    return {"success": True, "message": "Appointment booked", "data": None}