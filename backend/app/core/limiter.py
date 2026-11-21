import os
import sys

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

# By default, disable rate limiting during automated unit test runs unless explicitly activated
is_testing = "pytest" in sys.modules or os.getenv("TESTING", "").lower() in ("1", "true", "yes")

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
    enabled=not is_testing,
)


def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    detail_str = getattr(exc, "detail", str(exc))
    response = JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {detail_str}",
            "detail_ml": "നിരവധി അഭ്യർത്ഥനകൾ ഒരേസമയം ലഭിച്ചു. ദയവായി അല്പസമയത്തിന് ശേഷം വീണ്ടും ശ്രമിക്കുക (Too many requests)",
            "detail_en": "Rate limit exceeded. Please try again later.",
        },
        headers={"Retry-After": "60"},
    )
    return response
