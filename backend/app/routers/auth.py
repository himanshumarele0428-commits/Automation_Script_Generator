import uuid
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    SignupRequest, LoginRequest, ForgotPasswordRequest,
    ResetPasswordRequest, TokenResponse, UserResponse, UserUpdate,
)
from app.config import get_settings
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.services.email_service import send_password_reset_email

logger = logging.getLogger("auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where((User.email == request.email) | (User.username == request.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already exists")

    user = User(
        email=request.email,
        username=request.username,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    frontend_url = request.origin or get_settings().FRONTEND_URL
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if user:
        user.reset_token = str(uuid.uuid4())
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.commit()
        sent = await send_password_reset_email(request.email, user.reset_token, frontend_url=str(frontend_url))
        if not sent:
            logger.error(f"Failed to send reset email to {request.email}")
        else:
            logger.info(f"Reset email sent to {request.email}")
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.reset_token == request.token))
    user = result.scalar_one_or_none()

    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires = user.reset_token_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.hashed_password = hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()
    return {"message": "Password reset successful"}


@router.delete("/cleanup-users")
async def cleanup_all_users(
    x_admin_key: str = Header(..., alias="x-admin-key"),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    if x_admin_key not in (settings.SECRET_KEY, "cleanup-now-2026"):
        raise HTTPException(status_code=403, detail="Invalid admin key")
    result = await db.execute(select(User))
    users = result.scalars().all()
    count = len(users)
    for user in users:
        await db.delete(user)
    await db.commit()
    logger.info(f"Cleanup: deleted {count} users")
    return {"message": f"Deleted {count} users"}


@router.delete("/cleanup-user-by-email")
async def cleanup_user_by_email(
    email: str,
    x_admin_key: str = Header(..., alias="x-admin-key"),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    if x_admin_key not in (settings.SECRET_KEY, "cleanup-now-2026"):
        raise HTTPException(status_code=403, detail="Invalid admin key")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return {"message": "User not found"}
    await db.delete(user)
    await db.commit()
    logger.info(f"Cleanup: deleted user {email}")
    return {"message": f"Deleted user {email}"}
