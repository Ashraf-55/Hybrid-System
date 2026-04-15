from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from .mixins import SyncMixin
from datetime import datetime

class Safe(Base, SyncMixin):
    __tablename__ = "safes"
    # الـ id اتسحب من الـ Mixin أوتوماتيك
    name = Column(String) 
    balance = Column(Float, default=0.0)

class FinancialTransaction(Base, SyncMixin):
    __tablename__ = "financial_transactions"
    # ربط بـ UUID
    safe_id = Column(UUID(as_uuid=True), ForeignKey("safes.id"))
    amount = Column(Float)
    type = Column(String) # income, expense
    category = Column(String)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)