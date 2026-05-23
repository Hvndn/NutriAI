from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Tạo engine kết nối cơ sở dữ liệu
# Đối với PostgreSQL, create_engine hoạt động mặc định
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping=True giúp tự động kiểm tra lại kết nối khi bị ngắt
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Generator cung cấp database session và tự động đóng session sau khi xử lý xong API request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
