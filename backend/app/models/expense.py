from sqlalchemy import Column, String, Float, DateTime, Text
from app.database import Base
from .mixins import SyncMixin
import datetime

class Expense(Base, SyncMixin):
    __tablename__ = "expenses"
    
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String) 
    description = Column(Text)
    date = Column(DateTime, default=datetime.datetime.utcnow)