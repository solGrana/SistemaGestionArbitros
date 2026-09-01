import secrets
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.usuario_repository import UsuarioRepository
from app.models.usuario import Usuario, RolUsuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import hash_password


class UsuarioService:
    def __init__(self, db: Session):
        self.repo = UsuarioRepository(db)

    def crear(self, data: UsuarioCreate) -> Usuario:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="El email ya está registrado")

        if data.rol == RolUsuario.admin:
            if not data.password or len(data.password) < 6:
                raise HTTPException(status_code=400, detail="La contraseña es obligatoria para administradores (mínimo 6 caracteres)")
            password_hash = hash_password(data.password)
        else:
            # Por el momento solo los administradores pueden iniciar sesión:
            # se genera una contraseña aleatoria e inutilizable para el resto de los roles.
            password_hash = hash_password(secrets.token_urlsafe(32))

        usuario = Usuario(
            nombre=data.nombre,
            email=data.email,
            hashed_password=password_hash,
            rol=data.rol,
            telefono=data.telefono,
            direccion=data.direccion,
            ubicacion_lat=data.ubicacion_lat,
            ubicacion_lng=data.ubicacion_lng,
        )
        return self.repo.save(usuario)

    def listar(self, rol: Optional[str] = None) -> List[Usuario]:
        return self.repo.list_all(rol)

    def obtener(self, user_id: int) -> Usuario:
        usuario = self.repo.get_by_id(user_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario

    def actualizar(self, user_id: int, data: UsuarioUpdate) -> Usuario:
        usuario = self.obtener(user_id)
        for campo, valor in data.model_dump(exclude_none=True).items():
            setattr(usuario, campo, valor)
        return self.repo.save(usuario)

    def eliminar(self, user_id: int) -> None:
        usuario = self.obtener(user_id)
        self.repo.delete(usuario)
