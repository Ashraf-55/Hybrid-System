from sqlalchemy import Column, String, Float, DateTime
from app.database import Base
from datetime import datetime
from .mixins import SyncMixin

class Transaction(Base, SyncMixin):
    __tablename__ = "transactions"

    type = Column(String)  # "income" أو "expense"
    amount = Column(Float, nullable=False)
    description = Column(String)
    category = Column(String)
    date = Column(DateTime, default=datetime.utcnow)