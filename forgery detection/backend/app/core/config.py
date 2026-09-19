import os
from typing import List
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Document Forgery Detection"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "super-secret-jwt-forgery-detection-key-2026-secure-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Base Directory
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    # Database
    # Standard default is SQLite for immediate portability; override via DATABASE_URL env var if using MySQL
    DATABASE_URL: str = "sqlite:///./forgery_detection.db"
    SQLITE_FALLBACK_URL: str = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'forgery_detection.db')).replace(os.sep, '/')}"
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    PROCESSED_DIR: str = os.path.join(BASE_DIR, "processed")
    REPORTS_DIR: str = os.path.join(BASE_DIR, "reports")
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    DATASET_DIR: str = os.path.join(BASE_DIR, "dataset")
    
    # Upload limits
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "pdf"]
    
    # OCR & ML Configuration
    OCR_LANGUAGE: str = "eng"
    MODEL_PATH: str = os.path.join(MODELS_DIR, "forgery_detector.joblib")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]
    
    # SMTP / Email Configuration
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "security@forgeryguard.ai"
    EMAILS_FROM_NAME: str = "ForgeryGuard AI Security"
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Ensure directories exist
for directory in [
    settings.UPLOAD_DIR,
    settings.PROCESSED_DIR,
    settings.REPORTS_DIR,
    settings.MODELS_DIR,
    settings.DATASET_DIR,
]:
    os.makedirs(directory, exist_ok=True)
