import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


class ModalidadPago(str, enum.Enum):
    en_cancha     = "en_cancha"
    administrador = "administrador"


class Partido(Base):
    __tablename__ = "partidos"

    id                  = Column(Integer, primary_key=True, index=True)
    torneo_id           = Column(Integer, ForeignKey("torneos.id"),  nullable=False)
    fecha_hora          = Column(DateTime,                            nullable=False)
    cancha              = Column(String(120),                         nullable=False)
    direccion           = Column(String(255),                         nullable=True)
    ubicacion_lat       = Column(String(30),                          nullable=True)
    ubicacion_lng       = Column(String(30),                          nullable=True)
    equipo_local        = Column(String(120),                         nullable=True)
    equipo_visitante    = Column(String(120),                         nullable=True)
    cantidad_arbitros   = Column(Integer, default=1)
    cantidad_asistentes = Column(Integer, default=0)
    modalidad_pago      = Column(SAEnum(ModalidadPago), default=ModalidadPago.en_cancha)
    valor_arbitro       = Column(Integer, default=0)
    valor_asistente     = Column(Integer, default=0)
    notas               = Column(Text,                                nullable=True)

    torneo              = relationship("Torneo",     back_populates="partidos")
    asignaciones        = relationship("Asignacion", back_populates="partido", cascade="all, delete-orphan")
