from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.torneo import Torneo   # ✅


class TorneoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, torneo_id: int) -> Optional[Torneo]:
        return self.db.get(Torneo, torneo_id)

    def list_all(self, activo: Optional[bool] = None) -> List[Torneo]:
        q = self.db.query(Torneo)
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
