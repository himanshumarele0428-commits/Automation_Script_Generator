from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class TemplateCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    domain: str | None = None
    framework: str | None = None
    template_content: str = Field(min_length=1)


class TemplateUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    domain: str | None = None
    framework: str | None = None
    template_content: str | None = None


class TemplateResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    domain: str | None
    framework: str | None
    template_content: str
    is_system: bool
    created_at: datetime

    model_config = {"from_attributes": True}
