import uuid
import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .mixins import SyncMixin
from app.database import Base

class Patient(Base, SyncMixin):
    __tablename__ = "patients"
    
    # جعل الـ ID نصي
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    phone = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    appointments = relationship("Appointment", back_populates="patient")
    visits = relationship("Visit", back_populates="patient", cascade="all, delete-orphan")
    files = relationship("PatientFile", back_populates="patient", cascade="all, delete-orphan")
    dental_charts = relationship("DentalChart", back_populates="patient", cascade="all, delete-orphan")

class PatientFile(Base, SyncMixin):
    __tablename__ = "patient_files"
    
    # تعديل الـ Foreign Key ليكون String ليطابق الـ Patient.id
    patient_id = Column(String, ForeignKey("patients.id"))
    file_url = Column(String) 
    file_type = Column(String) 
    description = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="files")