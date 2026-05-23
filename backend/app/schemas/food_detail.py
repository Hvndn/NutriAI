from pydantic import BaseModel, ConfigDict
from typing import Optional

class FoodDetailBase(BaseModel):
    ingredient_name: str
    amount: Optional[str] = None
    is_healthy: Optional[bool] = True

class FoodDetailCreate(FoodDetailBase):
    pass

class FoodDetailResponse(FoodDetailBase):
    id: int
    scan_id: int

    model_config = ConfigDict(from_attributes=True)
