import jwt
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.usuario_repository import UsuarioRepository
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class AuthService:
    def __init__(self, db: Session):
        self.repo = UsuarioRepository(db)

    def login(self, email: str, password: str) -> dict:
        usuario = self.repo.get_by_email(email)
        if not usuario or not verify_password(password, usuario.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        return {
            "access_token":  create_access_token(usuario.id, usuario.rol),
            "refresh_token": create_refresh_token(usuario.id),
            "token_type":    "bearer",
            "usuario":       usuario,
        }

    def refresh(self, refresh_token: str) -> dict:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise HTTPException(status_code=401, detail="Token inválido")
            usuario = self.repo.get_by_id(int(payload["sub"]))
            if not usuario:
                raise HTTPException(status_code=401, detail="Usuario no encontrado")
            return {
                "access_token":  create_access_token(usuario.id, usuario.rol),
                "refresh_token": create_refresh_token(usuario.id),
                "token_type":    "bearer",
                "usuario":       usuario,
            }
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Refresh token expirado")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=401, detail="Token inválido")
