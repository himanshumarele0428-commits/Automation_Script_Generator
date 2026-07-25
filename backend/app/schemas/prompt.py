from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class PromptCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    prompt_content: str = Field(min_length=1)
    category: str | None = None


class PromptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    prompt_content: str | None = None
    category: str | None = None


class PromptResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    prompt_content: str
    category: str | None
    is_system: bool
    created_at: datetime

    model_config = {"from_attributes": True}
