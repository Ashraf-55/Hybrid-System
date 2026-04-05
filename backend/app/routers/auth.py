from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.security import verify_password, create_access_token, get_password_hash
from app.schemas import ApiResponse, UserCreate # تأكد إن UserCreate موجودة في schemas

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=ApiResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """إنشاء مستخدم جديد (لأول مرة أو من خلال الأدمن)"""
    
    # 1. التأكد من عدم تكرار اسم المستخدم
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="اسم المستخدم مسجل مسبقاً"
        )
    
    # 2. إنشاء الكائن وتشفير الباسورد
    new_user = User(
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "receptionist"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "تم إنشاء المستخدم بنجاح",
        "data": {
            "username": new_user.username,
            "full_name": new_user.full_name
        }
    }

@router.post("/login", response_model=ApiResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """تسجيل الدخول والحصول على التوكن وبيانات المستخدم"""
    
    # 1. البحث عن المستخدم
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 2. التحقق من صحة المستخدم والباسورد
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="اسم المستخدم أو كلمة المرور غير صحيحة"
        )
    
    # 3. إنشاء الـ JWT Token
    access_token = create_access_token(data={"sub": user.username})
    
    # 4. الرد الموحد شامل بيانات المستخدم للفرونت إند
    return {
        "success": True,
        "message": "تم تسجيل الدخول بنجاح",
        "data": {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role
            }
        }
    }