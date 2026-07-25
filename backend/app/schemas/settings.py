from pydantic import BaseModel, Field


class AISettingsUpdate(BaseModel):
    default_provider: str | None = None
    temperature: float | None = Field(default=None, ge=0, le=2)
    top_p: float | None = Field(default=None, ge=0, le=1)
    max_tokens: int | None = Field(default=None, ge=100, le=16000)


class ApiKeySet(BaseModel):
    provider: str = Field(...)
    api_key: str = Field(min_length=1)


class AISettingsResponse(BaseModel):
    default_provider: str
    temperature: float
    top_p: float
    max_tokens: int
    configured_providers: list[str]
