# Import tất cả các model để SQLAlchemy nhận diện metadata
from app.db.session import Base
from app.models.user import User
from app.models.scan import Scan
from app.models.food_detail import FoodDetail
