from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    identifier: str  # Email or phone number
    password: str
    expected_role: Optional[str] = None  # Optional check for role-specific portal login


class UserProfile(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    role_display_ml: str
    role_display_en: str
    department_id: Optional[UUID] = None
    department_name_ml: Optional[str] = None
    department_name_en: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserProfile


class RefreshTokenRequest(BaseModel):
    refresh_token: str
