from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class FoodDetail(Base):
    __tablename__ = "food_details"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    ingredient_name = Column(String, nullable=False)
    amount = Column(String, nullable=True) # VD: "50g", "1 muỗng"
    is_healthy = Column(Boolean, default=True)

    # Mối quan hệ
    scan = relationship("Scan", back_populates="ingredients")
