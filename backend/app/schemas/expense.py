from pydantic import BaseModel
from typing import Optional

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    description: Optional[str] = None