from typing import Optional
from .base_sync import SyncBaseSchema
from datetime import datetime

class ItemBase(SyncBaseSchema):
    name: str
    quantity: int
    min_stock_level: Optional[int] = 5
    unit_price: float
    category: Optional[str] = "General"

class ItemCreate(ItemBase):
    pass

class ItemOut(ItemBase):
    last_updated: datetime