# جوه ملف app/models/appointment.py
from sqlalchemy import Column, String, ForeignKey, DateTime
from app.database import Base
import datetime

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    appointment_date = Column(DateTime)
    status = Column(String, default="pending")