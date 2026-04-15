# app/routers/__init__.py
from .auth import router as auth_router
from .patients import router as patients_router
from .inventory import router as inventory_router
from .visits import router as visits_router
from .expenses import router as expenses_router
from .dental import router as dental_router
from .finance import router as finance_router
from .hr import router as hr_router
from .appointments import router as appointments_router