from fastapi import APIRouter
from app.api.v1.endpoints import auth, departments, complaints

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(departments.router)
api_router.include_router(complaints.router, prefix="/complaints")
