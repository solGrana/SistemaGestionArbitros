"""
Migra los datos de arbitros.db (SQLite) a la base Postgres indicada en DATABASE_URL.

Uso:
    python scripts/migrar_a_postgres.py

Requiere que DATABASE_URL (en .env o el entorno) apunte a una base Postgres
ALCANZABLE desde donde se ejecuta este script (el host interno de Railway
"*.railway.internal" solo es alcanzable desde servicios corriendo dentro de
Railway; para migrar desde una máquina local hay que usar la URL pública
del proxy de Railway).

Es seguro correrlo más de una vez: usa `merge()`, así que si una fila con
ese id ya existe en Postgres, la actualiza en vez de duplicarla.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.usuario import Usuario
from app.models.torneo import Torneo
from app.models.partido import Partido
from app.models.asignacion import Asignacion
from app.config import DATABASE_URL

SQLITE_URL = "sqlite:///" + os.path.join(os.path.dirname(__file__), "..", "arbitros.db")

if not DATABASE_URL.startswith("postgres"):
    sys.exit(
        "DATABASE_URL no apunta a Postgres (valor actual: "
        + DATABASE_URL
        + "). Configurala en .env antes de migrar."
    )

print(f"Origen  (SQLite):   {SQLITE_URL}")
print(f"Destino (Postgres): {DATABASE_URL.split('@')[-1]}")  # no imprime la contraseña

sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
pg_engine = create_engine(DATABASE_URL)

SqliteSession = sessionmaker(bind=sqlite_engine)
PgSession = sessionmaker(bind=pg_engine)

# Crea en Postgres todas las tablas que todavía no existan (respeta las ya creadas).
Base.metadata.create_all(bind=pg_engine)

src = SqliteSession()
dst = PgSession()


def copiar(modelo, nombre_tabla):
    filas = src.query(modelo).order_by(modelo.id).all()
    for fila in filas:
        datos = {c.name: getattr(fila, c.name) for c in modelo.__table__.columns}
        dst.merge(modelo(**datos))
    dst.commit()
    print(f"  {nombre_tabla}: {len(filas)} filas copiadas")


print("Copiando datos (en orden por dependencias de claves foráneas)...")
copiar(Usuario, "usuarios")
copiar(Torneo, "torneos")
copiar(Partido, "partidos")
copiar(Asignacion, "asignaciones")

# Reacomoda las secuencias de autoincremento de Postgres para que el próximo
# INSERT sin id explícito no choque con los ids que acabamos de copiar.
print("Reacomodando secuencias de autoincremento...")
for tabla in ("usuarios", "torneos", "partidos", "asignaciones"):
    dst.execute(text(
        f"SELECT setval(pg_get_serial_sequence('{tabla}', 'id'), "
        f"COALESCE((SELECT MAX(id) FROM {tabla}), 1))"
    ))
dst.commit()

src.close()
dst.close()
print("Migración completa.")
