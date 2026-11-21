import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SystemStats(BaseModel):
    total_users: int
    total_complaints: int
    active_complaints: int
    resolved_complaints: int
    total_departments: int
    active_alerts: int
    total_audit_logs: int


class UserAdminOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    role_display_ml: str
    department_id: Optional[uuid.UUID] = None
    department_name_ml: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    role: str = Field(..., description="'COMMUNITY', 'AUTHORITY', 'OFFICER', 'SUPER_ADMIN'")
    department_id: Optional[uuid.UUID] = None


class UserStatusUpdate(BaseModel):
    is_active: bool


class DepartmentCreate(BaseModel):
    code: str = Field(..., max_length=50)
    name_ml: str = Field(..., max_length=150)
    name_en: str = Field(..., max_length=150)
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class DepartmentAdminOut(BaseModel):
    id: uuid.UUID
    code: str
    name_ml: str
    name_en: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool = True
    user_count: int = 0
    complaint_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    entity_name: Optional[str] = None
    entity_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
