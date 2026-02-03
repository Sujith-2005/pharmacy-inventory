from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# Force reload .env to avoid stale cached values
load_dotenv(override=True)

# Determine absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'pharmacy.db')}"
    SECRET_KEY: str = "super-secret-local-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8003
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") # Explicit fetch after reload
    ALGORITHM: str = "HS256"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    EXPIRY_ALERT_DAYS: List[int] = [30, 60, 90]

    class Config:
        env_file = ENV_PATH
        extra = "ignore"   # <<< THIS LINE IS IMPORTANT

settings = Settings()
