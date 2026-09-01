import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import inspect, text

from app.database import engine, Base, SessionLocal
from app.models import Usuario, Torneo, Partido, Asignacion  # registra los modelos
from app.core.security import hash_password
from app.controllers.auth_controller       import router as auth_router
from app.controllers.usuario_controller    import router as usuario_router
from app.controllers.torneo_controller     import router as torneo_router
from app.controllers.partido_controller    import router as partido_router
from app.controllers.asignacion_controller import router as asignacion_router


# ── Crear tablas ──────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)


# ── Migración liviana (agrega columnas nuevas a tablas ya existentes) ─────────
def _migrate():
    insp = inspect(engine)
    tablas = insp.get_table_names()

    if "partidos" in tablas:
        columnas = {c["name"] for c in insp.get_columns("partidos")}
        with engine.begin() as conn:
            if "equipo_local" not in columnas:
                conn.execute(text("ALTER TABLE partidos ADD COLUMN equipo_local VARCHAR(120)"))
            if "equipo_visitante" not in columnas:
                conn.execute(text("ALTER TABLE partidos ADD COLUMN equipo_visitante VARCHAR(120)"))

    if "usuarios" in tablas:
        columnas = {c["name"] for c in insp.get_columns("usuarios")}
        with engine.begin() as conn:
            if "direccion" not in columnas:
                conn.execute(text("ALTER TABLE usuarios ADD COLUMN direccion VARCHAR(255)"))


_migrate()


# ── Seed inicial ──────────────────────────────────────────────────────────────
def _seed():
    db = SessionLocal()
    try:
        existe = db.query(Usuario).filter(Usuario.email == "admin@arbitros.com").first()
        if not existe:
            db.add(Usuario(
                nombre="Administrador",
                email="admin@arbitros.com",
                hashed_password=hash_password("admin1234"),
                rol="admin",
            ))
            db.commit()
            print("✅  Admin creado — email: admin@arbitros.com  |  contraseña: admin1234")
    finally:
        db.close()


_seed()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Gestión de Árbitros",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rutas API ─────────────────────────────────────────────────────────────────
app.include_router(auth_router,       prefix="/api")
app.include_router(usuario_router,    prefix="/api")
app.include_router(torneo_router,     prefix="/api")
app.include_router(partido_router,    prefix="/api")
app.include_router(asignacion_router, prefix="/api")

# ── Frontend estático ─────────────────────────────────────────────────────────
# Sin cache: el navegador revalida (ETag/Last-Modified) en cada carga en vez de
# quedarse con una versión vieja de HTML/CSS/JS entre actualizaciones.
class NoCacheStaticFiles(StaticFiles):
    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-cache"
        return response


_frontend = os.path.join(os.path.dirname(__file__), "..", "frontend")
_no_cache_headers = {"Cache-Control": "no-cache"}

app.mount("/css", NoCacheStaticFiles(directory=os.path.join(_frontend, "css")), name="css")
app.mount("/js",  NoCacheStaticFiles(directory=os.path.join(_frontend, "js")),  name="js")


@app.get("/")
def serve_login():
    return FileResponse(os.path.join(_frontend, "index.html"), headers=_no_cache_headers)


@app.get("/dashboard")
def serve_dashboard():
    return FileResponse(os.path.join(_frontend, "dashboard.html"), headers=_no_cache_headers)
