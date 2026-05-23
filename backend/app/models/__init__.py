from app.models.user import User
from app.models.scan import Scan
from app.models.food_detail import FoodDetail

# Export tất cả để SQLAlchemy Metadata nhận diện
__all__ = ["User", "Scan", "FoodDetail"]
