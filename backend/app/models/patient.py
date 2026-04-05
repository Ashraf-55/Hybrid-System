from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    dental_charts = relationship("DentalChart", back_populates="patient")

    # العلاقات - Relationships
    # 1. الزيارات
    visits = relationship("Visit", back_populates="patient", cascade="all, delete-orphan")
    
    # 2. الملفات المرفوعة (الأشعة والصور)
    files = relationship("PatientFile", back_populates="patient", cascade="all, delete-orphan")
    
    # 3. سجل الأسنان (ده السطر اللي كان عامل المشكلة)
    dental_records = relationship("DentalChart", back_populates="patient", cascade="all, delete-orphan")

class PatientFile(Base):
    __tablename__ = "patient_files"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    file_url = Column(String) 
    file_type = Column(String) # image, xray, pdf
    description = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="files")