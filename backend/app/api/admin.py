from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.auth import get_current_admin
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.scan import AdminStatsResponse
from app.services.stats_service import StatsService

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Lấy dữ liệu Analytics thống kê tổng quan của toàn bộ hệ thống."""
    return StatsService.get_admin_dashboard_stats(db)

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Lấy danh sách tất cả các người dùng đã đăng ký."""
    # Trả về danh sách user sắp xếp theo thời gian đăng ký mới nhất
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Block hoặc Unblock tài khoản của người dùng."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy người dùng này."
        )
    
    # Không cho phép tự block chính mình
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Bạn không thể tự khóa tài khoản Admin đang sử dụng của chính mình."
        )
        
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user
