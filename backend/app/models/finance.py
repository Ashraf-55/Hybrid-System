from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # "income" (دخل) أو "expense" (مصروف)
    amount = Column(Float, nullable=False)
    description = Column(String)
    category = Column(String)  # مثلاً: "كشف"، "إيجار"، "كهرباء"
    date = Column(DateTime, default=datetime.utcnow)