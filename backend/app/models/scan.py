from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=True)
    food_name = Column(String, nullable=False, index=True)
    
    # Dinh dưỡng đa lượng
    calories = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    protein = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    weight_grams = Column(Float, default=100.0)
    
    # Điểm đánh giá và lời khuyên sức khỏe
    health_score = Column(Integer, default=5)
    health_advice = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Mối quan hệ
    user = relationship("User", back_populates="scans")
    ingredients = relationship("FoodDetail", back_populates="scan", cascade="all, delete-orphan")
