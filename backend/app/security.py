from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# 1. إعدادات التشفير
SECRET_KEY = "your-super-secret-key-change-this" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # التوكن يفضل شغال يوم كامل

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. دالة تشفير الباسورد (عدلت الاسم لـ get_password_hash عشان يطابق الـ Import)
def get_password_hash(password: str):
    return pwd_context.hash(password)

# 3. دالة التأكد من الباسورد عند اللوجين
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 4. دالة إنشاء الـ Token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # بنخلي الديفولت يوم كامل (1440 دقيقة) بدل 15 عشان اليوزر ميفصلش منه بسرعة
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt