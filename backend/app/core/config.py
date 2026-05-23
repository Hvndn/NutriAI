import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "NutriAI"
    API_V1_STR: str = "/api"
    
    # Database Settings
    # Trong môi trường Docker hoặc local, PostgreSQL có thể được cấu hình qua DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nutrition_db")
    
    # JWT Authentication Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretjwtkey2026nutritionscanner")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 1 ngày
    
    # AI API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
