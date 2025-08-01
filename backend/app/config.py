import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost/financial_analysis"
    
    # OpenAI - optional for migrations
    OPENAI_API_KEY: Optional[str] = None

    # Logo.dev API keys
    LOGODEV_API_KEY: Optional[str] = None  # public token for logo images
    LOGODEV_SECRET_KEY: Optional[str] = None  # secret key for brand search
    
    # App settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]

settings = Settings()