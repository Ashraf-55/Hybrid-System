from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DentalChart(Base):
    __tablename__ = "dental_charts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id")) # تأكد إن اسم الجدول صح
    
    # السطر ده هو اللي ناقص أو فيه غلطة في الاسم
    patient = relationship("Patient", back_populates="dental_charts")