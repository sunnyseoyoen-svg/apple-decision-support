from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./harvest_advisor.db"
    OPENAI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    SECRET_KEY: str = secrets.token_urlsafe(32)

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | List[str]) -> str:
        if isinstance(v, list):
            return ",".join(v)
        return v

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return "postgresql" in self.DATABASE_URL

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()