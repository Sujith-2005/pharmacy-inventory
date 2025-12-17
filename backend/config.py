"""
Configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./pharmacy_inventory.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours to prevent "loop hole" logouts
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS - can be set as comma-separated string in .env
    # Pydantic Settings will automatically parse comma-separated strings
    CORS_ORIGINS: List[str] = [
        "https://pharmacy-inventory3.vercel.app",
        "https://pharmacy-inventory1.vercel.app",
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:5173"
    ]
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR: str = "./uploads"
    
    # ML/AI
    FORECAST_HORIZON_DAYS: int = 30
    LOW_STOCK_THRESHOLD_PERCENT: float = 0.2  # 20% of average stock
    EXPIRY_ALERT_DAYS: List[int] = [30, 60, 90]
    
    # Gemini AI
    GEMINI_API_KEY: str = ""  # Set in .env file
    
    class Config:
        env_file = ".env"


settings = Settings()


