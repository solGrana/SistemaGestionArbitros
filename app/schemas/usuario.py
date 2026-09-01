from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.usuario import RolUsuario


class UsuarioCreate(BaseModel):
    nombre:        str
    email:         EmailStr
    password:      Optional[str] = None
    rol:           RolUsuario   = RolUsuario.arbitro
    telefono:      Optional[str] = None
    direccion:     Optional[str] = None
    ubicacion_lat: Optional[str] = None
    ubicacion_lng: Optional[str] = None


class UsuarioUpdate(BaseModel):
    nombre:        Optional[str]       = None
    rol:           Optional[RolUsuario] = None
    telefono:      Optional[str]       = None
    direccion:     Optional[str]       = None
    ubicacion_lat: Optional[str]       = None
    ubicacion_lng: Optional[str]       = None


class UsuarioOut(BaseModel):
    id:            int
    nombre:        str
    email:         str
    rol:           RolUsuario
    telefono:      Optional[str] = None
    direccion:     Optional[str] = None
    ubicacion_lat: Optional[str] = None
    ubicacion_lng: Optional[str] = None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    usuario:       UsuarioOut


class RefreshRequest(BaseModel):
    refresh_token: str
