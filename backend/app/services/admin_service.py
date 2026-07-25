import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from app.models.script import GeneratedScript
from app.models.user import User
from app.models.audit_log import AuditLog


async def get_admin_stats(db: AsyncSession):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_scripts = (await db.execute(select(func.count(GeneratedScript.id)))).scalar() or 0
    total_prompts = 0

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    active_users = (await db.execute(
        select(func.count(func.distinct(GeneratedScript.user_id)))
        .where(GeneratedScript.created_at >= today_start)
    )).scalar() or 0

    return {
        "total_users": total_users,
        "total_scripts": total_scripts,
        "total_prompts": total_prompts,
        "active_users_today": active_users,
    }


async def get_users_list(db: AsyncSession):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


async def get_daily_usage(db: AsyncSession, days: int = 30):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(func.date(GeneratedScript.created_at), func.count())
        .where(GeneratedScript.created_at >= cutoff)
        .group_by(func.date(GeneratedScript.created_at))
        .order_by(func.date(GeneratedScript.created_at))
    )
    return [{"date": str(row[0]), "count": row[1]} for row in result]


async def get_framework_distribution(db: AsyncSession):
    result = await db.execute(
        select(GeneratedScript.framework, func.count())
        .group_by(GeneratedScript.framework)
    )
    return [{"framework": row[0], "count": row[1]} for row in result]


async def get_api_usage(db: AsyncSession):
    result = await db.execute(
        select(GeneratedScript.ai_provider, func.count())
        .group_by(GeneratedScript.ai_provider)
    )
    return [{"provider": row[0] or "unknown", "count": row[1]} for row in result]


async def get_audit_logs(db: AsyncSession, limit: int = 100):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    )
    return result.scalars().all()
