import enum
from sqlalchemy import Column, Integer, String, Enum as SAEnum
from app.database import Base


class RolUsuario(str, enum.Enum):
    admin        = "admin"
    arbitro      = "arbitro"
    organizacion = "organizacion"


class Usuario(Base):
    __tablename__ = "usuarios"

    id              = Column(Integer, primary_key=True, index=True)
    nombre          = Column(String(120), nullable=False)
    email           = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    rol             = Column(SAEnum(RolUsuario), nullable=False, default=RolUsuario.arbitro)
    telefono        = Column(String(30),  nullable=True)
    direccion       = Column(String(255), nullable=True)
    ubicacion_lat   = Column(String(30),  nullable=True)
    ubicacion_lng   = Column(String(30),  nullable=True)
