"""
Rate limiting para /api/*: un límite por IP y otro por usuario autenticado,
más un límite extra y más estricto sobre /api/auth/login para dificultar
ataques de fuerza bruta contra contraseñas.

Guarda los contadores en memoria (alcanza para una sola instancia del
servicio). Si el deploy pasa a correr varias réplicas en simultáneo, cada
una va a llevar su propio contador — para que el límite sea realmente
global entre réplicas hace falta un backend compartido (Redis), que hoy
no está provisionado en este proyecto.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from limits import parse
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter

from app.core.security import decode_token

IP_LIMIT       = parse("100/minute")
USER_LIMIT     = parse("300/minute")
LOGIN_IP_LIMIT = parse("10/minute")

_storage  = MemoryStorage()
_limiter  = MovingWindowRateLimiter(_storage)


def _usuario_id_del_token(request: Request) -> str | None:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None
    try:
        payload = decode_token(auth[7:].strip())
    except Exception:
        return None
    return payload.get("sub")


def _respuesta_429(limite) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Demasiadas solicitudes. Esperá un momento y volvé a intentar."},
        headers={"Retry-After": str(limite.get_expiry())},
    )


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if not path.startswith("/api"):
            return await call_next(request)

        ip = request.client.host if request.client else "desconocida"

        if path == "/api/auth/login" and not _limiter.hit(LOGIN_IP_LIMIT, "login-ip", ip):
            return _respuesta_429(LOGIN_IP_LIMIT)

        if not _limiter.hit(IP_LIMIT, "ip", ip):
            return _respuesta_429(IP_LIMIT)

        usuario_id = _usuario_id_del_token(request)
        if usuario_id is not None and not _limiter.hit(USER_LIMIT, "user", usuario_id):
            return _respuesta_429(USER_LIMIT)

        return await call_next(request)
