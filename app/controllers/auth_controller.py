from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import LoginRequest, TokenResponse, RefreshRequest, UsuarioCreate, UsuarioOut
from app.services.auth_service import AuthService
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    return AuthService(db).refresh(data.refresh_token)


@router.post("/register", response_model=UsuarioOut, status_code=201)
def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    return UsuarioService(db).crear(data)
