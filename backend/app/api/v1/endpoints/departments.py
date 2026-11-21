from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.department import Department
from app.models.auth import Role
from app.schemas.department import DepartmentResponse, RoleResponse

router = APIRouter()


@router.get("/departments", response_model=List[DepartmentResponse], tags=["Departments"])
def list_departments(db: Session = Depends(get_db)):
    """List all active Kerala administrative and environmental departments."""
    stmt = select(Department).where(Department.is_active == True).order_by(Department.name_en)
    departments = db.scalars(stmt).all()
    return departments


@router.get("/roles", response_model=List[RoleResponse], tags=["Roles"])
def list_roles(db: Session = Depends(get_db)):
    """List all available system roles with bilingual labels."""
    stmt = select(Role).order_by(Role.name)
    roles = db.scalars(stmt).all()
    return roles
