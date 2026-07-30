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
    CORS_ORIGINS: str = "http://localhost:5173,https://localhost:5173"
    RATE_LIMIT_PER_MINUTE: int = 30
    FRONTEND_URL: str = "http://localhost:5173"
    VERCEL_URL: str = ""
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "AI Script Generator <onboarding@resend.dev>"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


def get_settings() -> Settings:
    return Settings()
