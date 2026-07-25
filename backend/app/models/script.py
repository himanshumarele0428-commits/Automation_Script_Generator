import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, Integer, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base, GUID


class GeneratedScript(Base):
    __tablename__ = "generated_scripts"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    generated_code: Mapped[str] = mapped_column(Text, nullable=False)
    framework: Mapped[str] = mapped_column(String(50), nullable=False)
    browser: Mapped[str] = mapped_column(String(20), default="chrome")
    design_pattern: Mapped[str] = mapped_column(String(30), default="pom")
    language: Mapped[str] = mapped_column(String(20), nullable=False)
    options: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ai_model: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ai_provider: Mapped[str | None] = mapped_column(String(30), nullable=True)
    execution_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
