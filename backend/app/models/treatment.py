from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from .mixins import SyncMixin
import datetime

class TreatmentPlan(Base, SyncMixin):
    __tablename__ = "treatment_plans"
    
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    plan_name = Column(String) 
    total_cost = Column(Integer, default=0)
    status = Column(String, default="active") 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(Text)