from typing import Optional, List
from sqlalchemy.orm import Session, joinedload

from app.models.torneo import Torneo   # ✅


class TorneoRepository:
    def __init__(self, db: Session):
        self.db = db

    def _query_full(self):
        return self.db.query(Torneo).options(joinedload(Torneo.organizacion))

    def get_by_id(self, torneo_id: int) -> Optional[Torneo]:
        return self._query_full().filter(Torneo.id == torneo_id).first()

    def list_all(self, activo: Optional[bool] = None) -> List[Torneo]:
        q = self._query_full()
        if activo is not None:
            q = q.filter(Torneo.activo == activo)
        return q.order_by(Torneo.fecha_inicio.desc()).all()

    def save(self, torneo: Torneo) -> Torneo:
        self.db.add(torneo)
        self.db.commit()
        self.db.refresh(torneo)
        return torneo

    def delete(self, torneo: Torneo) -> None:
        self.db.delete(torneo)
        self.db.commit()
