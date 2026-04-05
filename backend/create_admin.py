from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.security import hash_password

def create_initial_admin():
    db = SessionLocal()
    try:
        # 1. التأكد إن اليوزر مش موجود قبل كدة عشان ميكررش
        admin_exists = db.query(User).filter(User.username == "admin").first()
        
        if not admin_exists:
            # 2. إنشاء بيانات الأدمن الأول
            new_admin = User(
                username="admin",
                full_name="Dr. Ashraf",
                email="admin@clinic.com",
                hashed_password=hash_password("admin123"), # الباسورد هنا "admin123"
                role="admin",
                is_active=True
            )
            
            db.add(new_admin)
            db.commit()
            print("✅ Admin user created successfully!")
            print("Username: admin")
            print("Password: admin123")
        else:
            print("⚠️ Admin user already exists.")
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin()