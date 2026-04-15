from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class SyncBaseSchema(BaseModel):
    id: UUID
    clinic_id: str
    is_synced: Optional[bool] = False
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)