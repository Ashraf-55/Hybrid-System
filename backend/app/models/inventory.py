from sqlalchemy import Column, String, Integer, Float, DateTime
from app.database import Base
from datetime import datetime
from .mixins import SyncMixin

class InventoryItem(Base, SyncMixin):
    __tablename__ = "inventory"
    name = Column(String, index=True, nullable=False)
    quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=5)
    unit_price = Column(Float, nullable=False)
    category = Column(String, default="General")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)