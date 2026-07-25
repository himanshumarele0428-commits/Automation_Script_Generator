import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.template import ScriptTemplate
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateResponse])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ScriptTemplate).where(
            (ScriptTemplate.is_system == True) | (ScriptTemplate.user_id == current_user.id)
        ).order_by(ScriptTemplate.created_at.desc())
    )
    return [TemplateResponse.model_validate(t) for t in result.scalars().all()]


@router.post("", response_model=TemplateResponse, status_code=201)
async def create_template(
    request: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = ScriptTemplate(
        user_id=current_user.id,
        title=request.title,
        description=request.description,
        domain=request.domain,
        framework=request.framework,
        template_content=request.template_content,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return TemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: uuid.UUID,
    request: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = await db.get(ScriptTemplate, template_id)
    if not template or (template.user_id != current_user.id and not template.is_system):
        raise HTTPException(status_code=404, detail="Template not found")
    if request.title is not None:
        template.title = request.title
    if request.description is not None:
        template.description = request.description
    if request.domain is not None:
        template.domain = request.domain
    if request.framework is not None:
        template.framework = request.framework
    if request.template_content is not None:
        template.template_content = request.template_content
    await db.commit()
    await db.refresh(template)
    return TemplateResponse.model_validate(template)


@router.delete("/{template_id}")
async def delete_template(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = await db.get(ScriptTemplate, template_id)
    if not template or (template.user_id != current_user.id and not template.is_system):
        raise HTTPException(status_code=404, detail="Template not found")
    await db.delete(template)
    await db.commit()
    return {"message": "Template deleted"}
