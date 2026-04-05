from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient, PatientFile # تأكد من صحة مسار الموديلات
from app.models.user import User
from app.firebase_config import upload_file_to_firebase
from app.dependencies import get_current_user
from app.schemas import ApiResponse
import shutil
import os

router = APIRouter(prefix="/patients", tags=["Patients"])

# --- 1. جلب قائمة المرضى (محمية) ---
@router.get("/", response_model=ApiResponse)
def get_patients(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """جلب كل المرضى - يتطلب تسجيل دخول"""
    patients = db.query(Patient).all()
    
    return {
        "success": True,
        "message": f"تم جلب {len(patients)} مريض بنجاح",
        "data": patients
    }

# --- 2. رفع ملفات المريض (محمية + معالجة أخطاء) ---
@router.post("/{patient_id}/upload-file", response_model=ApiResponse)
async def upload_patient_document(
    patient_id: str, 
    file: UploadFile = File(...), 
    file_type: str = "image", 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """رفع أشعة أو صور للمريض وتخزين الرابط في الداتابيز"""
    
    # التأكد من وجود المريض أولاً
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="المريض غير موجود")

    # 1. إنشاء مسار مؤقت للملف
    temp_path = f"temp_{patient_id}_{file.filename}"
    
    try:
        # 2. حفظ الملف مؤقتاً على السيرفر للقراءة
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 3. الرفع إلى Firebase
        remote_path = f"patients/{patient_id}/{file.filename}"
        cloud_url = upload_file_to_firebase(temp_path, remote_path)
        
        if not cloud_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="فشل الرفع إلى Firebase. تأكد من الإعدادات."
            )

        # 4. تسجيل الرابط في الداتابيز
        new_file = PatientFile(
            patient_id=patient_id,
            file_url=cloud_url,
            file_type=file_type,
            description=f"Uploaded by {current_user.username}: {file.filename}"
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        
        return {
            "success": True,
            "message": "تم رفع الملف بنجاح",
            "data": {
                "url": cloud_url,
                "file_id": new_file.id
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # 5. تنظيف السيرفر
        if os.path.exists(temp_path):
            os.remove(temp_path)