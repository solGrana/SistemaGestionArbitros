from pydantic import BaseModel
from app.models.asignacion import RolAsignacion


class AsignacionCreate(BaseModel):
    partido_id: int
    usuario_id: int
    rol:        RolAsignacion = RolAsignacion.arbitro
