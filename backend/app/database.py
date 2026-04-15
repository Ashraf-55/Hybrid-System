from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# مسار قاعدة البيانات (لو SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./hybrid_system.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# الفانكشن اللي كانت ناقصة ومطلوبة في الـ Routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()