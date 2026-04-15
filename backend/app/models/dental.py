from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from .mixins import SyncMixin

class DentalChart(Base, SyncMixin):
    __tablename__ = "dental_charts"

    # ربط بـ UUID
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id")) 
    
    patient = relationship("Patient", back_populates="dental_charts")