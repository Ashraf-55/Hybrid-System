from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import (
    auth, patients, inventory, visits, 
    expenses, dental, finance, hr, appointments
)

# 1. إنشاء الجداول
Base.metadata.create_all(bind=engine)

# 2. تعريف التطبيق (مرة واحدة فقط!)
app = FastAPI(
    title="Hybrid Clinic ERP System",
    description="Advanced System with Dental Chart, Cloud Storage, and Financial Safes",
    version="2.0.0"
)

# 3. إعدادات الـ CORS (بتتحط مرة واحدة للتطبيق الأساسي)
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

@app.get("/")
def home():
    return {
        "status": "Running",
        "system": "Hybrid Clinic ERP",
        "version": "2.0.0"
    }
@app.on_event("startup")
async def create_first_user():
    try:
        print("🚀 جاري فحص وجود مستخدم أدمن...")
        from app.utils import create_user_if_not_exists
        await create_user_if_not_exists()
    except Exception as e:
        print(f"⚠️ فشل إنشاء المستخدم التلقائي: {e}")