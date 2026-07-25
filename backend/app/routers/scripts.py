import uuid
import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.script import GeneratedScript
from app.schemas.script import (
    GenerateScriptRequest, ScriptResponse, ScriptListItem,
    HistoryResponse, DashboardStats,
)
from app.services.script_service import generate_script, get_user_scripts, get_dashboard_stats, toggle_favorite
from openpyxl import Workbook

router = APIRouter(prefix="/api/scripts", tags=["scripts"])


@router.post("/generate", response_model=ScriptResponse, status_code=201)
async def generate(
    request: GenerateScriptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        script = await generate_script(db, current_user.id, request)
        return ScriptResponse.model_validate(script)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stats/dashboard", response_model=DashboardStats)
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_dashboard_stats(db, current_user.id)


@router.get("", response_model=HistoryResponse)
async def list_scripts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    framework: str | None = None,
    language: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    favorite_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    df = datetime.fromisoformat(date_from) if date_from else None
    dt = datetime.fromisoformat(date_to) if date_to else None
    return await get_user_scripts(db, current_user.id, page, page_size, search, framework, language, df, dt, favorite_only)


@router.get("/export/csv")
async def export_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await get_user_scripts(db, current_user.id, page=1, page_size=10000)
    scripts = result["items"]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Framework", "Language", "Prompt", "Provider", "Favorite"])
    for s in scripts:
        writer.writerow([
            s.created_at.isoformat(),
            s.framework,
            s.language,
            s.prompt_text,
            s.ai_provider or "",
            "Yes" if s.is_favorite else "No",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scripts_export.csv"},
    )


@router.get("/export/excel")
async def export_excel(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await get_user_scripts(db, current_user.id, page=1, page_size=10000)
    scripts = result["items"]

    wb = Workbook()
    ws = wb.active
    ws.title = "Scripts"
    ws.append(["Date", "Framework", "Language", "Prompt", "Provider", "Favorite"])

    for s in scripts:
        ws.append([
            s.created_at.isoformat(),
            s.framework,
            s.language,
            s.prompt_text,
            s.ai_provider or "",
            "Yes" if s.is_favorite else "No",
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=scripts_export.xlsx"},
    )


@router.get("/{script_id}", response_model=ScriptResponse)
async def get_script(
    script_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    script = await db.get(GeneratedScript, script_id)
    if not script or script.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Script not found")
    return ScriptResponse.model_validate(script)


@router.delete("/{script_id}")
async def delete_script(
    script_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    script = await db.get(GeneratedScript, script_id)
    if not script or script.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Script not found")
    await db.delete(script)
    await db.commit()
    return {"message": "Script deleted"}


@router.patch("/{script_id}/favorite", response_model=ScriptResponse)
async def favorite_script(
    script_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    script = await toggle_favorite(db, script_id, current_user.id)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return ScriptResponse.model_validate(script)
