import time
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from datetime import datetime, timezone, timedelta
from app.models.script import GeneratedScript
from app.models.api_key import ApiKey
from app.schemas.script import GenerateScriptRequest, DashboardStats
from app.ai.provider_factory import get_provider
from app.ai.prompt_builder import build_prompt, get_language, get_file_extension
from app.utils.validators import validate_test_steps
from app.utils.encryption import decrypt_api_key


async def generate_script(
    db: AsyncSession,
    user_id: uuid.UUID,
    request: GenerateScriptRequest,
) -> GeneratedScript:
    test_steps = validate_test_steps(request.test_steps)

    provider_name = request.ai_provider or "groq"
    api_key_record = await db.execute(
        select(ApiKey).where(and_(ApiKey.user_id == user_id, ApiKey.provider == provider_name))
    )
    api_key_record = api_key_record.scalar_one_or_none()
    if api_key_record is None:
        from app.config import get_settings
        settings = get_settings()
        env_key = getattr(settings, f"{provider_name.upper()}_API_KEY", "")
        if not env_key:
            raise ValueError(f"No API key configured for {provider_name}. Set it in AI Settings.")
        api_key = env_key
    else:
        api_key = decrypt_api_key(api_key_record.encrypted_key)

    options_dict = request.options.model_dump() if request.options else {}

    system_prompt, user_prompt = build_prompt(
        test_steps=test_steps,
        framework=request.framework,
        browser=request.browser,
        design_pattern=request.design_pattern,
        options=options_dict,
        system_prompt_override=request.system_prompt,
        custom_prompt=request.custom_prompt,
    )

    llm_kwargs = {}
    if request.temperature is not None:
        llm_kwargs["temperature"] = request.temperature
    if request.top_p is not None:
        llm_kwargs["top_p"] = request.top_p
    if request.max_tokens is not None:
        llm_kwargs["max_tokens"] = request.max_tokens

    provider = get_provider(provider_name, api_key)

    start_time = time.time()
    generated_code = await provider.generate(system_prompt, user_prompt, **llm_kwargs)
    execution_time_ms = int((time.time() - start_time) * 1000)

    language = get_language(request.framework)
    script = GeneratedScript(
        user_id=user_id,
        prompt_text=test_steps,
        generated_code=generated_code,
        framework=request.framework,
        browser=request.browser,
        design_pattern=request.design_pattern,
        language=language,
        options=options_dict,
        ai_model=provider.model,
        ai_provider=provider_name,
        execution_time_ms=execution_time_ms,
    )
    db.add(script)
    await db.commit()
    await db.refresh(script)
    return script


async def get_user_scripts(
    db: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    framework: str | None = None,
    language: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    favorite_only: bool = False,
):
    query = select(GeneratedScript).where(GeneratedScript.user_id == user_id)

    if search:
        query = query.where(GeneratedScript.prompt_text.ilike(f"%{search}%"))
    if framework:
        query = query.where(GeneratedScript.framework == framework)
    if language:
        query = query.where(GeneratedScript.language == language)
    if date_from:
        query = query.where(GeneratedScript.created_at >= date_from)
    if date_to:
        query = query.where(GeneratedScript.created_at <= date_to)
    if favorite_only:
        query = query.where(GeneratedScript.is_favorite == True)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(desc(GeneratedScript.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()

    return {"items": items, "total": total, "page": page, "page_size": page_size}


async def get_dashboard_stats(db: AsyncSession, user_id: uuid.UUID) -> DashboardStats:
    total_query = select(func.count()).where(GeneratedScript.user_id == user_id)
    total_scripts = (await db.execute(total_query)).scalar() or 0

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_query = select(func.count()).where(
        and_(GeneratedScript.user_id == user_id, GeneratedScript.created_at >= today_start)
    )
    today_scripts = (await db.execute(today_query)).scalar() or 0

    fav_query = select(func.count()).where(
        and_(GeneratedScript.user_id == user_id, GeneratedScript.is_favorite == True)
    )
    favorite_scripts = (await db.execute(fav_query)).scalar() or 0

    framework_result = await db.execute(
        select(GeneratedScript.framework, func.count())
        .where(GeneratedScript.user_id == user_id)
        .group_by(GeneratedScript.framework)
    )
    framework_usage = {row[0]: row[1] for row in framework_result}

    lang_result = await db.execute(
        select(GeneratedScript.language, func.count())
        .where(GeneratedScript.user_id == user_id)
        .group_by(GeneratedScript.language)
    )
    language_usage = {row[0]: row[1] for row in lang_result}

    recent_result = await db.execute(
        select(GeneratedScript)
        .where(GeneratedScript.user_id == user_id)
        .order_by(desc(GeneratedScript.created_at))
        .limit(5)
    )
    recent_activity = recent_result.scalars().all()

    return DashboardStats(
        total_scripts=total_scripts,
        today_scripts=today_scripts,
        favorite_scripts=favorite_scripts,
        framework_usage=framework_usage,
        language_usage=language_usage,
        recent_activity=recent_activity,
    )


async def toggle_favorite(db: AsyncSession, script_id: uuid.UUID, user_id: uuid.UUID) -> GeneratedScript | None:
    script = await db.get(GeneratedScript, script_id)
    if script and script.user_id == user_id:
        script.is_favorite = not script.is_favorite
        await db.commit()
        await db.refresh(script)
        return script
    return None
