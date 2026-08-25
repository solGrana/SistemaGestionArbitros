from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.partido_repository import PartidoRepository
from app.repositories.torneo_repository import TorneoRepository
from app.models.partido import Partido
from app.schemas.partido import PartidoCreate, PartidoUpdate, PartidoOut


def _serializar(partido: Partido) -> dict:
    data = {c.name: getattr(partido, c.name) for c in partido.__table__.columns}
    data["torneo_nombre"] = partido.torneo.nombre if partido.torneo else None
    data["organizacion_nombre"] = (
        partido.torneo.organizacion.nombre
        if partido.torneo and partido.torneo.organizacion
        else "Sin organización"
    )
    data["asignaciones"] = [
        {
            "id":  a.id,
            "rol": a.rol,
            "usuario": {
                "id":            a.usuario.id,
                "nombre":        a.usuario.nombre,
                "email":         a.usuario.email,
                "rol":           a.usuario.rol,
                "telefono":      a.usuario.telefono,
                "ubicacion_lat": a.usuario.ubicacion_lat,
                "ubicacion_lng": a.usuario.ubicacion_lng,
            },
        }
        for a in partido.asignaciones
    ]
    return data


class PartidoService:
    def __init__(self, db: Session):
        self.repo        = PartidoRepository(db)
        self.torneo_repo = TorneoRepository(db)

    def crear(self, data: PartidoCreate) -> dict:
        if not self.torneo_repo.get_by_id(data.torneo_id):
            raise HTTPException(status_code=404, detail="Torneo no encontrado")
        partido = Partido(**data.model_dump())
        guardado = self.repo.save(partido)
        return _serializar(guardado)

    def listar(self, torneo_id: Optional[int] = None, sin_asignar: bool = False) -> List[dict]:
        partidos = self.repo.list_all(torneo_id)
        if sin_asignar:
            partidos = [
                p for p in partidos
                if len(p.asignaciones) < p.cantidad_arbitros + p.cantidad_asistentes
            ]
        return [_serializar(p) for p in partidos]

    def obtener(self, partido_id: int) -> dict:
        partido = self.repo.get_by_id(partido_id)
        if not partido:
            raise HTTPException(status_code=404, detail="Partido no encontrado")
        return _serializar(partido)

    def actualizar(self, partido_id: int, data: PartidoUpdate) -> dict:
        partido = self.repo.get_by_id(partido_id)
        if not partido:
            raise HTTPException(status_code=404, detail="Partido no encontrado")
        for campo, valor in data.model_dump(exclude_none=True).items():
            setattr(partido, campo, valor)
        guardado = self.repo.save(partido)
        return _serializar(guardado)

    def eliminar(self, partido_id: int) -> None:
        partido = self.repo.get_by_id(partido_id)
        if not partido:
            raise HTTPException(status_code=404, detail="Partido no encontrado")
        self.repo.delete(partido)
