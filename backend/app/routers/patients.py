import shutil
import os
from uuid import UUID
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Patient, PatientFile
from app.firebase_config import upload_file_to_firebase
from app.dependencies import get_current_user
from app.schemas import ApiResponse

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/{patient_id}/upload-file", response_model=ApiResponse)
async def upload_patient_document(
    patient_id: UUID, # لازم يكون UUID
    file: UploadFile = File(...), 
    file_type: str = "image", 
    db: Session = Depends(get_db),
    current=Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.clinic_id == current.clinic_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="المريض غير موجود أو لا يتبع عيادتك")

    temp_path = f"temp_{patient_id}_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # تنظيم الفايلات في Firebase حسب العيادة ثم المريض
        remote_path = f"clinics/{current.clinic_id}/patients/{patient_id}/{file.filename}"
        cloud_url = upload_file_to_firebase(temp_path, remote_path)
        
        if not cloud_url:
            raise HTTPException(status_code=500, detail="فشل الرفع للسحابة")

        new_file = PatientFile(
            patient_id=patient_id,
            clinic_id=current.clinic_id, # إضافة الـ clinic_id للـ File
            file_url=cloud_url,
            file_type=file_type,
            description=f"رفع بواسطة: {current.full_name}"
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        
        return {"success": True, "message": "تم رفع الملف بنجاح", "data": {"url": cloud_url}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)