from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.usuario import Usuario, RolUsuario


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[Usuario]:
        return self.db.get(Usuario, user_id)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.db.query(Usuario).filter(Usuario.email == email).first()

    def list_all(self, rol: Optional[str] = None) -> List[Usuario]:
        q = self.db.query(Usuario)
        if rol:
            q = q.filter(Usuario.rol == rol)
        return q.order_by(Usuario.nombre).all()

    def save(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def delete(self, usuario: Usuario) -> None:
        self.db.delete(usuario)
        self.db.commit()
