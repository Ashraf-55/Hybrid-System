from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from app.database import Base
import datetime

class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    plan_name = Column(String) # مثلاً: تقويم، حشو عصب
    total_cost = Column(Integer, default=0)
    status = Column(String, default="active") # active, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)