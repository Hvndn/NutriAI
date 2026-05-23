from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.food_detail import FoodDetailResponse

class ScanBase(BaseModel):
    food_name: str
    calories: float
    carbs: float
    protein: float
    fat: float
    weight_grams: float = 100.0
    health_score: int = 5
    health_advice: Optional[str] = None
    image_url: Optional[str] = None

class ScanCreate(ScanBase):
    pass

class ScanResponse(ScanBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScanResponseWithIngredients(ScanResponse):
    ingredients: List[FoodDetailResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Schema theo dõi calories hàng ngày
class DailyCaloriesResponse(BaseModel):
    date: str
    calories_consumed: float
    calories_goal: float
    remaining_calories: float
    protein_grams: float
    carbs_grams: float
    fat_grams: float
    scans_count: int

# Schema Analytics cho Admin
class TopFoodItem(BaseModel):
    food_name: str
    scan_count: int

class AdminStatsResponse(BaseModel):
    total_users: int
    total_scans: int
    average_calories: float
    top_foods: List[TopFoodItem]
    scan_growth: List[Dict[str, Any]] # Thống kê lượt scan theo ngày
