import uuid
import datetime
from sqlalchemy import Column, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from .mixins import SyncMixin

class Visit(Base, SyncMixin):
    __tablename__ = "visits"
    
    # توحيد الأنواع لنصوص
    patient_id = Column(String, ForeignKey("patients.id")) 
    doctor_id = Column(String, ForeignKey("users.id"))
    
    diagnosis = Column(Text)
    prescription = Column(Text)
    total_fees = Column(Float, default=0.0)
    doctor_share = Column(Float, default=0.0) 
    visit_date = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="visits")
    doctor = relationship("User", back_populates="visits_as_doctor")