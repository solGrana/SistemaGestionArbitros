from pydantic import BaseModel
from typing import Optional
from datetime import date


class TorneoCreate(BaseModel):
    nombre:       str
    descripcion:  Optional[str]  = None
    fecha_inicio: Optional[date] = None
    fecha_fin:    Optional[date] = None
    activo:       bool           = True


class TorneoUpdate(BaseModel):
    nombre:       Optional[str]  = None
    descripcion:  Optional[str]  = None
    fecha_inicio: Optional[date] = None
    fecha_fin:    Optional[date] = None
    activo:       Optional[bool] = None


class TorneoOut(BaseModel):
    id:              int
    nombre:          str
    descripcion:     Optional[str]  = None
    fecha_inicio:    Optional[date] = None
    fecha_fin:       Optional[date] = None
    organizacion_id: Optional[int]  = None
    activo:          bool

    model_config = {"from_attributes": True}