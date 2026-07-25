import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.prompt import PromptTemplate
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptResponse

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.get("", response_model=list[PromptResponse])
async def list_prompts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PromptTemplate).where(
            (PromptTemplate.is_system == True) | (PromptTemplate.user_id == current_user.id)
        ).order_by(PromptTemplate.created_at.desc())
    )
    return [PromptResponse.model_validate(p) for p in result.scalars().all()]


@router.post("", response_model=PromptResponse, status_code=201)
async def create_prompt(
    request: PromptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = PromptTemplate(
        user_id=current_user.id,
        title=request.title,
        description=request.description,
        prompt_content=request.prompt_content,
        category=request.category,
    )
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return PromptResponse.model_validate(prompt)


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: uuid.UUID,
    request: PromptUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = await db.get(PromptTemplate, prompt_id)
    if not prompt or (prompt.user_id != current_user.id and not prompt.is_system):
        raise HTTPException(status_code=404, detail="Prompt not found")
    if request.title is not None:
        prompt.title = request.title
    if request.description is not None:
        prompt.description = request.description
    if request.prompt_content is not None:
        prompt.prompt_content = request.prompt_content
    if request.category is not None:
        prompt.category = request.category
    await db.commit()
    await db.refresh(prompt)
    return PromptResponse.model_validate(prompt)


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prompt = await db.get(PromptTemplate, prompt_id)
    if not prompt or (prompt.user_id != current_user.id and not prompt.is_system):
        raise HTTPException(status_code=404, detail="Prompt not found")
    await db.delete(prompt)
    await db.commit()
    return {"message": "Prompt deleted"}
