from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
