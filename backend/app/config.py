import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:////tmp/qa_automation.db"
    SECRET_KEY: str = "change-me-in-production-use-a-strong-random-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    ENCRYPTION_KEY: str = "change-me-fernet-key-must-be-32-bytes"
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEFAULT_AI_PROVIDER: str = "groq"
    CORS_ORIGINS: str = "http://localhost:5173,https://localhost:5173,https://qa-script-generator.vercel.app"
    RATE_LIMIT_PER_MINUTE: int = 30
    FRONTEND_URL: str = "http://localhost:5173"
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "AI Script Generator <noreply@qaautomation.app>"
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "AI Script Generator <onboarding@resend.dev>"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def resolved_frontend_url(self) -> str:
        vercel_url = os.environ.get("VERCEL_URL", "")
        if vercel_url and self.FRONTEND_URL == "http://localhost:5173":
            return f"https://{vercel_url}"
        return self.FRONTEND_URL

    @property
    def resolved_cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",")]
        vercel_url = os.environ.get("VERCEL_URL", "")
        if vercel_url:
            https_origin = f"https://{vercel_url}"
            if https_origin not in origins:
                origins.append(https_origin)
        return origins


def get_settings() -> Settings:
    return Settings()
