from typing import Optional
from .base_sync import SyncBaseSchema
from datetime import datetime

class TransactionBase(SyncBaseSchema):
    type: str  # income or expense
    amount: float
    description: Optional[str] = None
    category: str

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    date: datetime