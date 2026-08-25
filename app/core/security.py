from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES

#pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12, truncate_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain[:72], hashed)


def _create_token(data: dict, expires: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(user_id: int, rol: str) -> str:
    return _create_token(
        {"sub": str(user_id), "rol": rol, "type": "access"},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: int) -> str:
    return _create_token(
        {"sub": str(user_id), "type": "refresh"},
        timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES),
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
