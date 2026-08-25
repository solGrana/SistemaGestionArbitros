from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.partido import PartidoCreate, PartidoUpdate
from app.services.partido_service import PartidoService
from app.core.dependencies import get_current_user, require_admin_or_org
from app.models.usuario import Usuario

router = APIRouter(prefix="/partidos", tags=["Partidos"])


@router.get("/")
def listar(
    torneo_id:   Optional[int]  = Query(None),
    sin_asignar: bool           = Query(False),
    db: Session = Depends(get_db),
    _: Usuario  = Depends(get_current_user),
):
    return PartidoService(db).listar(torneo_id, sin_asignar)


@router.post("/", status_code=201)
def crear(
    data: PartidoCreate,
    db: Session = Depends(get_db),
    _: Usuario  = Depends(require_admin_or_org),
):
    return PartidoService(db).crear(data)


@router.get("/{partido_id}")
def obtener(
    partido_id: int,
    db: Session = Depends(get_db),
    _: Usuario  = Depends(get_current_user),
):
    return PartidoService(db).obtener(partido_id)


@router.patch("/{partido_id}")
def actualizar(
    partido_id: int,
    data: PartidoUpdate,
    db: Session = Depends(get_db),
    _: Usuario  = Depends(require_admin_or_org),
):
    return PartidoService(db).actualizar(partido_id, data)


@router.delete("/{partido_id}", status_code=204)
def eliminar(
    partido_id: int,
    db: Session = Depends(get_db),
    _: Usuario  = Depends(require_admin_or_org),
):
    PartidoService(db).eliminar(partido_id)
