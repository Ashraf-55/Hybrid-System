from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from app.database import Base
from datetime import datetime
from .mixins import SyncMixin

class Employee(Base, SyncMixin):
    __tablename__ = "employees"
    name = Column(String, nullable=False)
    role = Column(String) 
    base_salary = Column(Float, default=0.0)
    phone = Column(String)
    hire_date = Column(DateTime, default=datetime.utcnow)

class SalaryPayment(Base, SyncMixin):
    __tablename__ = "salary_payments"
    # ربط بـ UUID الموظف
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    amount_paid = Column(Float)
    payment_date = Column(DateTime, default=datetime.utcnow)
    month = Column(String)