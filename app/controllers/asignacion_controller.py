from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.asignacion import AsignacionCreate
from app.schemas.usuario import UsuarioOut
from app.services.asignacion_service import AsignacionService
from app.core.dependencies import get_current_user, require_admin_or_org
from app.models.usuario import Usuario

router = APIRouter(prefix="/asignaciones", tags=["Asignaciones"])


@router.post("/", status_code=201)
def asignar(
    data: AsignacionCreate,
    db: Session = Depends(get_db),
    _: Usuario  = Depends(require_admin_or_org),
):
    return AsignacionService(db).asignar(data.partido_id, data.usuario_id, data.rol)


@router.delete("/")
def desasignar(
    partido_id: int = Query(...),
    usuario_id: int = Query(...),
    db: Session = Depends(get_db),
    _: Usuario  = Depends(require_admin_or_org),
):
    AsignacionService(db).desasignar(partido_id, usuario_id)
    return {"ok": True}


@router.get("/disponibles", response_model=List[UsuarioOut])
def disponibles(
    partido_id: int = Query(...),
    db: Session = Depends(get_db),
    _: Usuario  = Depends(get_current_user),
):
    return AsignacionService(db).disponibles(partido_id)
