from sqlalchemy import Column, String, Float, DateTime, Text
from app.database import Base
import datetime

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False) # اسم المصروف (إيجار، كهرباء، أدوات)
    amount = Column(Float, nullable=False)
    category = Column(String) # تصنيف (ثابت، متغير، طوارئ)
    description = Column(Text)
    date = Column(DateTime, default=datetime.datetime.utcnow)