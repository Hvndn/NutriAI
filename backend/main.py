import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api.auth import router as auth_router
from app.api.scans import router as scans_router
from app.api.admin import router as admin_router

# Tự động tạo toàn bộ các bảng trong database khi khởi chạy server
# Rất tiện lợi cho việc phát triển cục bộ và deploy nhanh lên Railway
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Error initializing database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API Service cho ứng dụng quét và phân tích dinh dưỡng đa nền tảng NutriAI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cấu hình CORS cho phép cả Web App (localhost:3000) và Mobile App gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép tất cả nguồn gọi tới trong môi trường Dev & Mobile
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kết nối các routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(scans_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
def health_check():
    """Endpoint kiểm tra sức khỏe hệ thống."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "database": "connected"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
