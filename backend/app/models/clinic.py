import uuid
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Clinic(Base):
    __tablename__ = "clinics"

    # هنا خلينا الـ id نص (String) عشان الـ SQLite تفهمه
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    subscription_plan = Column(String, default="free")
    is_synced = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())