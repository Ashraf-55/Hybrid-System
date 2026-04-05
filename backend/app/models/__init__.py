from .user import User
from .patient import Patient, PatientFile
from .appointment import Appointment
from .expense import Expense
from .inventory import InventoryItem
from .visit import Visit
from .accounting import Safe, FinancialTransaction
from .treatment import TreatmentPlan  # <--- السطر ده هو اللي هيحل المشكلة
from .dental import DentalChart