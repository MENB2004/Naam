from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    yield
    # Shutdown tasks


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="NAAM (നാം) - Environmental Monitoring and Community Grievance Redressal API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

COMMON_BILINGUAL_ERRORS = {
    404: {
        "detail_ml": "അഭ്യർത്ഥിച്ച വിവരങ്ങൾ കണ്ടെത്താനായില്ല",
        "detail_en": "The requested resource was not found",
    },
    403: {
        "detail_ml": "ഈ പ്രവർത്തനം നടത്താൻ നിങ്ങൾക്ക് അനുമതിയില്ല",
        "detail_en": "You do not have permission to perform this action",
    },
    401: {
        "detail_ml": "ലോഗിൻ വിവരങ്ങൾ അസാധുവാണ് അല്ലെങ്കിൽ ലോഗിൻ ചെയ്തിട്ടില്ല",
        "detail_en": "Authentication required or credentials invalid",
    },
    500: {
        "detail_ml": "സെർവറിൽ സാങ്കേതിക തടസ്സം നേരിട്ടു",
        "detail_en": "Internal server error occurred",
    },
}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    bilingual_fallback = COMMON_BILINGUAL_ERRORS.get(exc.status_code, {})

    content = {
        "detail": exc.detail,
    }
    if bilingual_fallback.get("detail_ml"):
        content["detail_ml"] = bilingual_fallback["detail_ml"]
    if bilingual_fallback.get("detail_en"):
        content["detail_en"] = bilingual_fallback["detail_en"]

    return JSONResponse(status_code=exc.status_code, content=content, headers=exc.headers)

from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "NAAM Central API",
        "service_ml": "നാം കേന്ദ്രീകൃത പ്ലാറ്റ്‌ഫോം",
        "version": settings.PROJECT_VERSION,
        "environment": "development"
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def v1_health_check():
    return {
        "status": "ok",
        "api_version": "v1"
    }
