from sqlalchemy import Column, Integer, String, Text, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Torneo(Base):
    __tablename__ = "torneos"

    id              = Column(Integer, primary_key=True, index=True)
    nombre          = Column(String(120), nullable=False)
    descripcion     = Column(Text,        nullable=True)
    fecha_inicio    = Column(Date,        nullable=True)
    fecha_fin       = Column(Date,        nullable=True)
    organizacion_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    activo          = Column(Boolean, default=True)

    organizacion    = relationship("Usuario", foreign_keys=[organizacion_id])
    partidos        = relationship("Partido", back_populates="torneo", cascade="all, delete-orphan")

    @property
    def organizacion_nombre(self):
        return self.organizacion.nombre if self.organizacion else None
