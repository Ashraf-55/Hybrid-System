from sqlalchemy.orm import Session
from app.models import (
    Patient, User, Visit, Appointment, 
    InventoryItem, Expense, Employee, 
    Safe, FinancialTransaction, DentalChart, TreatmentPlan
)

# قاموس لربط اسم الجدول (القادم من الفرونت إند) بالموديل الفعلي في الداتا بيز
MODEL_MAPPER = {
    "patients": Patient,
    "users": User,
    "visits": Visit,
    "appointments": Appointment,
    "inventory": InventoryItem,
    "expenses": Expense,
    "employees": Employee,
    "safes": Safe,
    "financial_transactions": FinancialTransaction,
    "dental_charts": DentalChart,
    "treatment_plans": TreatmentPlan
}

class SyncEngine:
    def __init__(self, db: Session):
        self.db = db

    def process_batch(self, table_name: str, records: list):
        model = MODEL_MAPPER.get(table_name)
        if not model:
            return {"status": "error", "message": f"Table {table_name} not supported"}

        synced_count = 0
        for record_data in records:
            try:
                # البحث عن السجل باستخدام الـ UUID
                existing_record = self.db.query(model).filter(model.id == record_data['id']).first()
                
                if existing_record:
                    # تحديث السجل الموجود
                    for key, value in record_data.items():
                        if hasattr(existing_record, key):
                            setattr(existing_record, key, value)
                    existing_record.is_synced = True 
                else:
                    # إضافة سجل جديد (سيستخدم الـ id والـ clinic_id القادمين من العيادة)
                    new_record = model(**record_data)
                    new_record.is_synced = True
                    self.db.add(new_record)
                
                synced_count += 1
            except Exception as e:
                print(f"Error syncing record in {table_name}: {e}")
                continue # تخطي السجل الذي به مشكلة والاستمرار في الباقي
        
        self.db.commit()
        return {"status": "success", "table": table_name, "synced_count": synced_count}