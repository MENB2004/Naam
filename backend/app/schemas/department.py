from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class DepartmentResponse(BaseModel):
    id: UUID
    code: str
    name_ml: str
    name_en: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class RoleResponse(BaseModel):
    id: UUID
    name: str
    display_name_ml: str
    display_name_en: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
