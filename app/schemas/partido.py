from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.partido import ModalidadPago
from app.schemas.usuario import UsuarioOut


class PartidoCreate(BaseModel):
    torneo_id:           int
    fecha_hora:          datetime
    cancha:              str
    direccion:           Optional[str]  = None
    ubicacion_lat:       Optional[str]  = None
    ubicacion_lng:       Optional[str]  = None
    equipo_local:        str
    equipo_visitante:    str
    cantidad_arbitros:   int            = 1
    cantidad_asistentes: int            = 0
    modalidad_pago:      ModalidadPago  = ModalidadPago.en_cancha
    valor_arbitro:       int            = 0
    valor_asistente:     int            = 0


class PartidoUpdate(BaseModel):
    fecha_hora:          Optional[datetime]       = None
    cancha:              Optional[str]            = None
    direccion:           Optional[str]            = None
    ubicacion_lat:       Optional[str]            = None
    ubicacion_lng:       Optional[str]            = None
    equipo_local:        Optional[str]            = None
    equipo_visitante:    Optional[str]            = None
    cantidad_arbitros:   Optional[int]            = None
    cantidad_asistentes: Optional[int]            = None
    modalidad_pago:      Optional[ModalidadPago]  = None
    valor_arbitro:       Optional[int]            = None
    valor_asistente:     Optional[int]            = None


class AsignacionOut(BaseModel):
    id:      int
    rol:     str
    usuario: UsuarioOut

    model_config = {"from_attributes": True}


class PartidoOut(BaseModel):
    id:                  int
    torneo_id:           int
    torneo_nombre:       Optional[str] = None
    fecha_hora:          datetime
    cancha:              str
    direccion:           Optional[str] = None
    ubicacion_lat:       Optional[str] = None
    ubicacion_lng:       Optional[str] = None
    equipo_local:        Optional[str] = None
    equipo_visitante:    Optional[str] = None
    cantidad_arbitros:   int
    cantidad_asistentes: int
    modalidad_pago:      ModalidadPago
    valor_arbitro:       int
    valor_asistente:     int
    asignaciones:        List[AsignacionOut] = []

    model_config = {"from_attributes": True}
