from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.torneo import TorneoCreate, TorneoOut, TorneoUpdate
from app.services.torneo_service import TorneoService
from app.core.dependencies import get_current_user, require_admin_or_org
from app.models.usuario import Usuario

router = APIRouter(prefix="/torneos", tags=["Torneos"])


@router.get("/", response_model=List[TorneoOut])
def listar(
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return TorneoService(db).listar(activo)


@router.post("/", response_model=TorneoOut, status_code=201)
def crear(
    data: TorneoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_org),  
):
    return TorneoService(db).crear(data)


@router.get("/{torneo_id}", response_model=TorneoOut)
def obtener(
    torneo_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return TorneoService(db).obtener(torneo_id)


@router.patch("/{torneo_id}", response_model=TorneoOut)
def actualizar(
    torneo_id: int,
    data: TorneoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_org),
):
    return TorneoService(db).actualizar(torneo_id, data)


@router.delete("/{torneo_id}", status_code=204)
def eliminar(
    torneo_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin_or_org),
):
    TorneoService(db).eliminar(torneo_id)
