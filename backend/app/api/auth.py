from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core import security
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login-form-compatibility")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """Dependency lấy thông tin người dùng hiện tại dựa trên JWT Token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực danh tính. Token không hợp lệ hoặc đã hết hạn.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = security.decode_access_token(token)
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Tài khoản này đã bị khóa.")
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency kiểm tra quyền Admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập chức năng này."
        )
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Đăng ký tài khoản người dùng mới."""
    # Kiểm tra email tồn tại
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email này đã được sử dụng."
        )
    
    hashed_password = security.get_password_hash(user_in.password)
    # Nếu là tài khoản đầu tiên hoặc email đặc biệt -> Set Admin để dễ dàng quản trị test
    is_admin = False
    if db.query(User).count() == 0 or user_in.email.startswith("admin"):
        is_admin = True

    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        daily_calorie_goal=user_in.daily_calorie_goal,
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_data: UserCreate, db: Session = Depends(get_db)):
    """Đăng nhập bằng Email và Password, trả về Access Token."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc mật khẩu không chính xác."
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Tài khoản của bạn đã bị khóa.")
    
    access_token = security.create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-form-compatibility", include_in_schema=False)
def login_form_compatibility(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """Router phụ tương thích với FastAPI Swagger OAuth2 flow."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc mật khẩu không chính xác."
        )
    access_token = security.create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Lấy thông tin người dùng hiện tại."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin profile người dùng hiện tại (tên, email, mục tiêu calories, mật khẩu)."""
    if user_update.email is not None and user_update.email != current_user.email:
        # Check email trùng
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email này đã được sử dụng.")
        current_user.email = user_update.email
        
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
        
    if user_update.daily_calorie_goal is not None:
        current_user.daily_calorie_goal = user_update.daily_calorie_goal
        
    if user_update.password is not None:
        current_user.hashed_password = security.get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user
