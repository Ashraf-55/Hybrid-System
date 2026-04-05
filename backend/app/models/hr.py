from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base
from datetime import datetime

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String)  # (Nurse, Receptionist, Accountant)
    base_salary = Column(Float, default=0.0)
    phone = Column(String)
    hire_date = Column(DateTime, default=datetime.utcnow)

class SalaryPayment(Base):
    __tablename__ = "salary_payments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer)
    amount_paid = Column(Float)
    payment_date = Column(DateTime, default=datetime.utcnow)
    month = Column(String) # (e.g., "March 2026")