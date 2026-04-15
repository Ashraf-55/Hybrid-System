from sqlalchemy.orm import relationship
import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    # تحويل الـ ID لنص عشان SQLite ميزعلش
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="staff") # admin, doctor, staff
    is_active = Column(Boolean, default=True)
    visits_as_doctor = relationship("Visit", back_populates="doctor", foreign_keys="[Visit.doctor_id]")
    appointments = relationship("Appointment", back_populates="doctor")
    
    # ربط العيادة (برضه كـ String)
    clinic_id = Column(String, ForeignKey("clinics.id"))
    
    # حقول المزامنة ضيفها يدوي هنا
    is_synced = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())