from fastapi import APIRouter
from app.api.v1.endpoints import auth, departments, complaints, maps, alerts, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(departments.router)
api_router.include_router(complaints.router, prefix="/complaints")
api_router.include_router(maps.router, prefix="/map", tags=["map"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])


