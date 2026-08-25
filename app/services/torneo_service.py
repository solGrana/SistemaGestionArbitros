from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.torneo_repository import TorneoRepository
from app.models.torneo import Torneo
from app.schemas.torneo import TorneoCreate, TorneoUpdate


class TorneoService:
    def __init__(self, db: Session):
        self.repo = TorneoRepository(db)

    def crear(self, data: TorneoCreate) -> Torneo: 
        torneo = Torneo(**data.model_dump())
        return self.repo.save(torneo)

    def listar(self, activo: Optional[bool] = None) -> List[Torneo]:
        return self.repo.list_all(activo)

    def obtener(self, torneo_id: int) -> Torneo:
        torneo = self.repo.get_by_id(torneo_id)
        if not torneo:
            raise HTTPException(status_code=404, detail="Torneo no encontrado")
        return torneo

    def actualizar(self, torneo_id: int, data: TorneoUpdate) -> Torneo:
        torneo = self.obtener(torneo_id)
        for campo, valor in data.model_dump(exclude_none=True).items():
            setattr(torneo, campo, valor)
        return self.repo.save(torneo)

    def eliminar(self, torneo_id: int) -> None:
        torneo = self.obtener(torneo_id)
        self.repo.delete(torneo)
