from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from app.database import Base
import datetime

class Safe(Base):
    __tablename__ = "safes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) 
    balance = Column(Float, default=0.0)

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    id = Column(Integer, primary_key=True, index=True)
    safe_id = Column(Integer, ForeignKey("safes.id"))
    amount = Column(Float)
    type = Column(String) # income, expense
    category = Column(String)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)