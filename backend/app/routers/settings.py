from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.api_key import ApiKey
from app.schemas.settings import AISettingsUpdate, ApiKeySet, AISettingsResponse
from app.utils.encryption import encrypt_api_key
from app.config import get_settings

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/ai", response_model=AISettingsResponse)
async def get_ai_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = get_settings()
    result = await db.execute(
        select(ApiKey.provider).where(ApiKey.user_id == current_user.id)
    )
    configured = [row[0] for row in result]
    return AISettingsResponse(
        default_provider=settings.DEFAULT_AI_PROVIDER,
        temperature=0.7,
        top_p=0.95,
        max_tokens=4096,
        configured_providers=configured,
    )


@router.post("/api-keys")
async def set_api_key(
    request: ApiKeySet,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ApiKey).where(
            (ApiKey.user_id == current_user.id) & (ApiKey.provider == request.provider)
        )
    )
    key_record = result.scalar_one_or_none()
    encrypted = encrypt_api_key(request.api_key)

    if key_record:
        key_record.encrypted_key = encrypted
    else:
        key_record = ApiKey(user_id=current_user.id, provider=request.provider, encrypted_key=encrypted)
        db.add(key_record)

    await db.commit()
    return {"message": f"API key for {request.provider} saved"}


@router.delete("/api-keys/{provider}")
async def delete_api_key(
    provider: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ApiKey).where(
            (ApiKey.user_id == current_user.id) & (ApiKey.provider == provider)
        )
    )
    key_record = result.scalar_one_or_none()
    if key_record:
        await db.delete(key_record)
        await db.commit()
    return {"message": f"API key for {provider} removed"}
