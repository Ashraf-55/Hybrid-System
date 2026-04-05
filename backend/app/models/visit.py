from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class Visit(Base):
    __tablename__ = "visits"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id")) 
    doctor_id = Column(Integer, ForeignKey("users.id"))
    
    diagnosis = Column(Text)
    prescription = Column(Text)
    total_fees = Column(Float, default=0.0)
    doctor_share = Column(Float, default=0.0) # نصيب الدكتور من الكشف
    visit_date = Column(DateTime, default=datetime.datetime.utcnow)

    # الربط مع كلاس المريض
    patient = relationship("Patient", back_populates="visits")