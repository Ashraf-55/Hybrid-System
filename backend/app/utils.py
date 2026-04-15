import uuid
from app.database import SessionLocal
from app import models
from app.security import get_password_hash 

async def create_user_if_not_exists():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == "admin").first()
        if not user:
            print("🆕 جاري إنشاء حساب أدمن وعيادة...")
            clinic = db.query(models.Clinic).first()
            if not clinic:
                clinic = models.Clinic(id=str(uuid.uuid4()), name="Default Clinic")
                db.add(clinic)
                db.commit()
                db.refresh(clinic)

            new_user = models.User(
                id=str(uuid.uuid4()),
                username="admin",
                email="admin@clinic.com",
                full_name="Admin Doctor",
                hashed_password=get_password_hash("123"),
                is_active=True,
                role="admin",
                clinic_id=clinic.id 
            )
            db.add(new_user)
            db.commit()
            print("✅ تم إنشاء حساب الأدمن بنجاح (admin/123)")
        else:
            print("✅ حساب الأدمن موجود بالفعل.")
    except Exception as e:
        print(f"⚠️ خطأ: {e}")
    finally:
        db.close()