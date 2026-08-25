import enum
from sqlalchemy import Column, Integer, ForeignKey, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class RolAsignacion(str, enum.Enum):
    arbitro   = "arbitro"
    asistente = "asistente"


class Asignacion(Base):
    __tablename__ = "asignaciones"
    __table_args__ = (
        UniqueConstraint("partido_id", "usuario_id", name="uq_partido_usuario"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    partido_id = Column(Integer, ForeignKey("partidos.id"),  nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"),  nullable=False)
    rol        = Column(SAEnum(RolAsignacion), nullable=False, default=RolAsignacion.arbitro)

    partido    = relationship("Partido",  back_populates="asignaciones")
    usuario    = relationship("Usuario",  foreign_keys=[usuario_id])
