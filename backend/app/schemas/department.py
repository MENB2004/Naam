from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DepartmentResponse(BaseModel):
    id: UUID
    code: str
    name_ml: str
    name_en: str
    contact_email: str | None = None
    contact_phone: str | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class RoleResponse(BaseModel):
    id: UUID
    name: str
    display_name_ml: str
    display_name_en: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)
