from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioOut, UsuarioUpdate
from app.services.usuario_service import UsuarioService
from app.core.dependencies import get_current_user, require_admin
from app.models.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/me", response_model=UsuarioOut)
def me(current: Usuario = Depends(get_current_user)):
    return current


@router.get("/", response_model=List[UsuarioOut])
def listar(
    rol: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return UsuarioService(db).listar(rol)


@router.get("/{user_id}", response_model=UsuarioOut)
def obtener(
    user_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return UsuarioService(db).obtener(user_id)


@router.patch("/{user_id}", response_model=UsuarioOut)
def actualizar(
    user_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    return UsuarioService(db).actualizar(user_id, data)


@router.delete("/{user_id}", status_code=204)
def eliminar(
    user_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    UsuarioService(db).eliminar(user_id)
