from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.partido import Partido


class PartidoRepository:
    def __init__(self, db: Session):
        self.db = db

    def _query_full(self):
        return self.db.query(Partido).options(
            joinedload(Partido.torneo),
            joinedload(Partido.asignaciones),
        )

    def get_by_id(self, partido_id: int) -> Optional[Partido]:
        return self._query_full().filter(Partido.id == partido_id).first()

    def list_all(self, torneo_id: Optional[int] = None) -> List[Partido]:
        q = self._query_full()
        if torneo_id:
            q = q.filter(Partido.torneo_id == torneo_id)
        return q.order_by(Partido.fecha_hora).all()

    def save(self, partido: Partido) -> Partido:
        self.db.add(partido)
        self.db.commit()
        self.db.refresh(partido)
        return self.get_by_id(partido.id)

    def delete(self, partido: Partido) -> None:
        self.db.delete(partido)
        self.db.commit()
