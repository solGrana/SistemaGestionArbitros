from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.asignacion import Asignacion, RolAsignacion
from app.models.usuario import Usuario, RolUsuario


class AsignacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_partido_y_usuario(self, partido_id: int, usuario_id: int) -> Optional[Asignacion]:
        return self.db.query(Asignacion).filter(
            Asignacion.partido_id == partido_id,
            Asignacion.usuario_id == usuario_id,
        ).first()

    def list_by_partido(self, partido_id: int) -> List[Asignacion]:
        return self.db.query(Asignacion).filter(Asignacion.partido_id == partido_id).all()

    def list_arbitros_disponibles(self, partido_id: int) -> List[Usuario]:
        asignados = {
            a.usuario_id
            for a in self.list_by_partido(partido_id)
        }
        q = self.db.query(Usuario).filter(Usuario.rol == RolUsuario.arbitro)
        if asignados:
            q = q.filter(~Usuario.id.in_(asignados))
        return q.order_by(Usuario.nombre).all()

    def save(self, asignacion: Asignacion) -> Asignacion:
        self.db.add(asignacion)
        self.db.commit()
        self.db.refresh(asignacion)
        return asignacion

    def delete(self, asignacion: Asignacion) -> None:
        self.db.delete(asignacion)
        self.db.commit()
