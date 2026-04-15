# app/schemas/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True)