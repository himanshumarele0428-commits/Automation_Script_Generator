from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class AdminStats(BaseModel):
    total_users: int
    total_scripts: int
    total_prompts: int
    active_users_today: int


class UserAdminItem(BaseModel):
    id: UUID
    email: str
    username: str
    role: str
    is_active: bool
    created_at: datetime


class DailyUsage(BaseModel):
    date: str
    count: int


class FrameworkDistribution(BaseModel):
    framework: str
    count: int


class APIUsageStats(BaseModel):
    provider: str
    count: int


class AuditLogItem(BaseModel):
    id: UUID
    event_type: str
    details: dict | None
    ip_address: str | None
    created_at: datetime
