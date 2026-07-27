import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import get_settings

settings = get_settings()

_requests: dict[str, list[float]] = defaultdict(list)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = 60

        _requests[client_ip] = [t for t in _requests[client_ip] if now - t < window]

        if len(_requests[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

        _requests[client_ip].append(now)

        response = await call_next(request)
        return response
