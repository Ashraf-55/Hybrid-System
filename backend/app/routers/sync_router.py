from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.sync_service import SyncEngine
from app.schemas.schemas import ApiResponse
from typing import Dict, List, Any

router = APIRouter(prefix="/sync", tags=["Synchronization"])

@router.post("/batch", response_model=ApiResponse)
async def sync_data_batch(
    payload: Dict[str, List[Any]], 
    db: Session = Depends(get_db)
):
    """
    هذا الـ Endpoint يستقبل شحنة بيانات (Batch) منظمة كالتالي:
    {
        "patients": [{...}, {...}],
        "visits": [{...}]
    }
    """
    engine = SyncEngine(db)
    results = []
    
    try:
        # بنلف على كل جدول مبعوث في الـ JSON
        for table_name, records in payload.items():
            result = engine.process_batch(table_name, records)
            results.append(result)
        
        return ApiResponse(
            success=True,
            message="تمت عملية المزامنة بنجاح",
            data=results
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء المزامنة: {str(e)}")