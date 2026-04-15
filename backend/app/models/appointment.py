from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from .mixins import SyncMixin
import uuid

class Appointment(Base, SyncMixin):
    __tablename__ = "appointments"

    # لازم يكون String عشان يطابق الـ User.id اللي عملناه
    doctor_id = Column(String, ForeignKey("users.id"))
    patient_id = Column(String, ForeignKey("patients.id"))
    
    appointment_date = Column(DateTime)
    status = Column(String, default="pending") # pending, confirmed, cancelled
    notes = Column(Text)

    # الربط العكسي
    doctor = relationship("User", back_populates="appointments")
    patient = relationship("Patient", back_populates="appointments")