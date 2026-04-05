from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import get_password_hash  # تأكد إن عندك دالة بتشفر الباسورد

async def create_user_if_not_exists():
    # 1. فتح اتصال بالداتابيز
    db = SessionLocal()
    try:
        # 2. الفحص: هل فيه مستخدم باسم admin؟
        user = db.query(models.User).filter(models.User.username == "admin").first()
        
        if not user:
            print("🆕 لم يتم العثور على أدمن، جاري إنشاء حساب تلقائي...")
            # 3. بيانات الأدمن اللي هتدخل بيها
            new_user = models.User(
                username="admin",
                email="admin@clinic.com",
                full_name="Admin Doctor",
                hashed_password=get_password_hash("123"), # الباسورد هيكون 123
                is_active=True,
                role="admin"
            )
            db.add(new_user)
            db.commit()
            print("✅ تم إنشاء حساب الأدمن بنجاح (User: admin | Pass: 123)")
        else:
            print("✅ حساب الأدمن موجود بالفعل، جاهز للعمل.")
    except Exception as e:
        print(f"⚠️ خطأ أثناء فحص المستخدم: {e}")
    finally:
        db.close()