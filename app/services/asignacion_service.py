from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.asignacion_repository import AsignacionRepository
from app.repositories.partido_repository import PartidoRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.models.asignacion import Asignacion, RolAsignacion
from app.models.usuario import RolUsuario


class AsignacionService:
    def __init__(self, db: Session):
        self.repo         = AsignacionRepository(db)
        self.partido_repo = PartidoRepository(db)
        self.usuario_repo = UsuarioRepository(db)

    def asignar(self, partido_id: int, usuario_id: int, rol: RolAsignacion) -> Asignacion:
        partido = self.partido_repo.get_by_id_simple(partido_id)
        if not partido:
            raise HTTPException(status_code=404, detail="Partido no encontrado")

        usuario = self.usuario_repo.get_by_id(usuario_id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if usuario.rol not in (RolUsuario.arbitro, RolUsuario.admin):
            raise HTTPException(status_code=400, detail="El usuario no tiene rol de árbitro")

        asignaciones = self.repo.list_by_partido(partido_id)
        if any(a.usuario_id == usuario_id for a in asignaciones):
            raise HTTPException(status_code=400, detail="El árbitro ya está asignado a este partido")

        arbitros   = sum(1 for a in asignaciones if a.rol == RolAsignacion.arbitro)
        asistentes = sum(1 for a in asignaciones if a.rol == RolAsignacion.asistente)

        if rol == RolAsignacion.arbitro   and arbitros   >= partido.cantidad_arbitros:
            raise HTTPException(status_code=400, detail="Cupo de árbitros completo")
        if rol == RolAsignacion.asistente and asistentes >= partido.cantidad_asistentes:
            raise HTTPException(status_code=400, detail="Cupo de asistentes completo")

        nueva = Asignacion(partido_id=partido_id, usuario_id=usuario_id, rol=rol)
        return self.repo.save(nueva)

    def desasignar(self, partido_id: int, usuario_id: int) -> None:
        asignacion = self.repo.get_by_partido_y_usuario(partido_id, usuario_id)
        if not asignacion:
            raise HTTPException(status_code=404, detail="Asignación no encontrada")
        self.repo.delete(asignacion)

    def disponibles(self, partido_id: int) -> list:
        return self.repo.list_arbitros_disponibles(partido_id)
