from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# تعديل الاستيراد عشان Base تكون موجودة
from app.database import SessionLocal, engine, Base 
from app.routers import (
    auth, patients, inventory, visits, 
    expenses, dental, finance, hr, appointments,
    sync_router # ضيف ده بالمرة عشان المزامنة تشتغل
)

# 1. إنشاء الجداول (Base دلوقتي متعرفة)
Base.metadata.create_all(bind=engine)

# 2. تعريف التطبيق
app = FastAPI(
    title="Hybrid Clinic ERP System",
    description="Advanced System with Dental Chart, Cloud Storage, and Financial Safes",
    version="2.0.0"
)

# 3. إعدادات الـ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. ربط الروترات
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(inventory.router)
app.include_router(visits.router)
app.include_router(expenses.router)
app.include_router(dental.router)
app.include_router(finance.router)
app.include_router(hr.router)
app.include_router(appointments.router)
app.include_router(sync_router.router) # تفعيل راوتر المزامنة

@app.get("/")
def home():
    return {
        "status": "Running",
        "system": "Hybrid Clinic ERP",
        "version": "2.0.0"
    }

@app.on_event("startup")
async def startup_event():
    try:
        print("🚀 جاري فحص وجود مستخدم أدمن...")
        # تأكد إن ملف app/utils.py بيستخدم: from app.database import ...
        from app.utils import create_user_if_not_exists
        await create_user_if_not_exists()
        print("✅ تم فحص/إنشاء المستخدم الافتراضي")
    except Exception as e:
        print(f"⚠️ فشل إنشاء المستخدم التلقائي: {e}")