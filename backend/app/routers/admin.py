from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_admin_user
from app.models.user import User
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return await admin_service.get_admin_stats(db)


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return await admin_service.get_users_list(db)


@router.get("/analytics/usage")
async def daily_usage(
    days: int = Query(30, le=365),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return await admin_service.get_daily_usage(db, days)


@router.get("/analytics/frameworks")
async def framework_distribution(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return await admin_service.get_framework_distribution(db)


@router.get("/analytics/api-consumption")
async def api_consumption(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return await admin_service.get_api_usage(db)


@router.get("/logs")
async def error_logs(
    limit: int = Query(100, le=500),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return await admin_service.get_audit_logs(db, limit)
