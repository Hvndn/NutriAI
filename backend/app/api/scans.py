from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.food_detail import FoodDetail
from app.schemas.scan import ScanResponseWithIngredients, DailyCaloriesResponse, ScanResponse, ScanBase
from app.schemas.food_detail import FoodDetailBase, FoodDetailResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/scans", tags=["AI Nutrition Scanner"])

@router.post("/analyze", response_model=ScanResponseWithIngredients, status_code=status.HTTP_201_CREATED)
async def analyze_food(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload ảnh thực phẩm, phân tích dinh dưỡng bằng Gemini Vision AI và lưu lịch sử."""
    
    # Kiểm tra định dạng file
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Tệp tải lên phải là một hình ảnh."
        )

    # Đọc bytes hình ảnh
    contents = await file.read()
    
    # Phân tích ảnh món ăn bằng AI Service
    ai_result = await AIService.analyze_food_image(contents, file.filename)
    
    # Tạo bản ghi Scan mới trong database
    # Sử dụng mockup URL hình ảnh để demo mượt mà (hoặc lưu base64)
    # Ở đây chúng ta lưu base64 URL ngắn hoặc giả lập
    image_base64 = f"data:{file.content_type};base64,{AIService.get_mock_nutrition(file.filename) if not contents else 'mock'}"
    # Để an toàn, chúng ta sẽ gán link ảnh demo của Unsplash cho đẹp mắt trên UI
    image_url = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60"
    if "pho" in file.filename.lower() or "noodle" in file.filename.lower():
        image_url = "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&auto=format&fit=crop&q=60"
    elif "burger" in file.filename.lower():
        image_url = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"
    elif "salad" in file.filename.lower():
        image_url = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60"

    new_scan = Scan(
        user_id=current_user.id,
        image_url=image_url,
        food_name=ai_result.get("food_name", "Món ăn chưa xác định"),
        calories=float(ai_result.get("calories", 0.0)),
        carbs=float(ai_result.get("carbs", 0.0)),
        protein=float(ai_result.get("protein", 0.0)),
        fat=float(ai_result.get("fat", 0.0)),
        weight_grams=float(ai_result.get("weight_grams", 100.0)),
        health_score=int(ai_result.get("health_score", 5)),
        health_advice=ai_result.get("health_advice", "Không có lời khuyên cụ thể.")
    )
    
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
    
    # Lưu các thành phần chi tiết (ingredients) vào bảng FoodDetail
    ingredients_list = ai_result.get("ingredients", [])
    for ing in ingredients_list:
        detail = FoodDetail(
            scan_id=new_scan.id,
            ingredient_name=ing.get("ingredient_name"),
            amount=ing.get("amount", ""),
            is_healthy=ing.get("is_healthy", True)
        )
        db.add(detail)
    
    db.commit()
    db.refresh(new_scan)
    
    return new_scan

@router.get("/", response_model=List[ScanResponseWithIngredients])
def get_scans_history(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy danh sách lịch sử quét thực phẩm của người dùng hiện tại."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    if search:
        query = query.filter(Scan.food_name.ilike(f"%{search}%"))
    
    # Sắp xếp theo ngày quét mới nhất
    return query.order_by(Scan.created_at.desc()).all()

@router.get("/daily-tracker", response_model=DailyCaloriesResponse)
def get_daily_calorie_tracker(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy tổng hợp chỉ số dinh dưỡng đã nạp trong ngày hôm nay."""
    today = datetime.now(timezone.utc).date()
    
    # Query tổng calories, carbs, protein, fat đã quét hôm nay
    today_scans = db.query(Scan).filter(
        Scan.user_id == current_user.id,
        func.date(Scan.created_at) == today
    ).all()
    
    calories_consumed = sum(scan.calories for scan in today_scans)
    protein_grams = sum(scan.protein for scan in today_scans)
    carbs_grams = sum(scan.carbs for scan in today_scans)
    fat_grams = sum(scan.fat for scan in today_scans)
    
    calories_goal = float(current_user.daily_calorie_goal)
    remaining_calories = max(0.0, calories_goal - calories_consumed)
    
    return {
        "date": today.strftime("%Y-%m-%d"),
        "calories_consumed": float(calories_consumed),
        "calories_goal": calories_goal,
        "remaining_calories": float(remaining_calories),
        "protein_grams": float(protein_grams),
        "carbs_grams": float(carbs_grams),
        "fat_grams": float(fat_grams),
        "scans_count": len(today_scans)
    }

@router.get("/{scan_id}", response_model=ScanResponseWithIngredients)
def get_scan_detail(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy chi tiết một lượt quét cụ thể."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi quét món ăn này trong lịch sử của bạn."
        )
    return scan

@router.delete("/{scan_id}", status_code=status.HTTP_200_OK)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Xóa một lượt quét khỏi lịch sử."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi quét món ăn để xóa."
        )
    db.delete(scan)
    db.commit()
    return {"message": "Đã xóa lịch sử quét thực phẩm thành công."}

@router.put("/{scan_id}", response_model=ScanResponseWithIngredients)
def update_scan_result(
    scan_id: int,
    scan_update: ScanBase, # Dùng ScanBase để cập nhật thông tin chỉnh sửa thủ công
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cập nhật, chỉnh sửa thủ công thông số dinh dưỡng của món ăn đã quét."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi quét món ăn cần chỉnh sửa."
        )
    
    # Cập nhật thông số
    scan.food_name = scan_update.food_name
    scan.calories = scan_update.calories
    scan.carbs = scan_update.carbs
    scan.protein = scan_update.protein
    scan.fat = scan_update.fat
    scan.weight_grams = scan_update.weight_grams
    scan.health_score = scan_update.health_score
    if scan_update.health_advice:
        scan.health_advice = scan_update.health_advice
        
    db.commit()
    db.refresh(scan)
    return scan

@router.post("/{scan_id}/ingredients", response_model=FoodDetailResponse, status_code=status.HTTP_201_CREATED)
def add_ingredient_to_scan(
    scan_id: int,
    ingredient_in: FoodDetailBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Thêm thủ công một thành phần nguyên liệu mới vào món ăn đã quét."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi quét món ăn này."
        )
        
    new_detail = FoodDetail(
        scan_id=scan.id,
        ingredient_name=ingredient_in.ingredient_name,
        amount=ingredient_in.amount,
        is_healthy=ingredient_in.is_healthy
    )
    db.add(new_detail)
    db.commit()
    db.refresh(new_detail)
    return new_detail
