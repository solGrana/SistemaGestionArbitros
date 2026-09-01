from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import DATABASE_URL

# "check_same_thread" es un parámetro exclusivo del driver de SQLite;
# otros motores (Postgres, etc.) no lo aceptan.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependencia de FastAPI: abre y cierra la sesión por request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
