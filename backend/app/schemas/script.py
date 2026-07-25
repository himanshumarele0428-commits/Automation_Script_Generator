from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class ScriptOptions(BaseModel):
    assertions: bool = True
    comments: bool = True
    explicit_waits: bool = True
    error_handling: bool = True
    logging: bool = False
    screenshots: bool = False
    retry_logic: bool = False
    generate_test_data: bool = False


class GenerateScriptRequest(BaseModel):
    test_steps: str = Field(min_length=5, max_length=5000)
    framework: str = Field(...)
    browser: str = "chrome"
    design_pattern: str = "pom"
    options: ScriptOptions = ScriptOptions()
    ai_provider: str | None = None
    temperature: float | None = Field(default=None, ge=0, le=2)
    top_p: float | None = Field(default=None, ge=0, le=1)
    max_tokens: int | None = Field(default=None, ge=100, le=16000)
    system_prompt: str | None = None
    custom_prompt: str | None = None


class ScriptResponse(BaseModel):
    id: UUID
    prompt_text: str
    generated_code: str
    framework: str
    browser: str
    design_pattern: str
    language: str
    options: dict | None
    ai_model: str | None
    ai_provider: str | None
    execution_time_ms: int | None
    is_favorite: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ScriptListItem(BaseModel):
    id: UUID
    prompt_text: str
    framework: str
    language: str
    ai_provider: str | None
    is_favorite: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    items: list[ScriptListItem]
    total: int
    page: int
    page_size: int


class DashboardStats(BaseModel):
    total_scripts: int
    today_scripts: int
    favorite_scripts: int
    framework_usage: dict[str, int]
    language_usage: dict[str, int]
    recent_activity: list[ScriptListItem]
