import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario

bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id = int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def require_admin(current: Usuario = Depends(get_current_user)) -> Usuario:
    if current.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    return current


def require_admin_or_org(current: Usuario = Depends(get_current_user)) -> Usuario:
    if current.rol not in ("admin", "organizacion"):
        raise HTTPException(status_code=403, detail="Sin permisos suficientes")
    return current
