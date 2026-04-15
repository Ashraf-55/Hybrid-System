import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

class SyncMixin:
    # 1. المعرف الفريد العالمي
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 2. لربط البيانات بالعيادة (عشان السيستم سحابي)
    clinic_id = Column(String, nullable=False, index=True)
    
    # 3. حالة المزامنة
    is_synced = Column(Boolean, default=False)
    
    # 4. وقت التعديل (مهم جداً لحل النزاعات logic)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())