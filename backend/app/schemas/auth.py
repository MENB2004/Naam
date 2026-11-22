from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    password: str = Field(..., min_length=8, max_length=128)
    preferred_language: str | None = "ml"
    locality: str | None = Field(None, max_length=255)
    privacy_consent: bool

    @model_validator(mode="after")
    def require_privacy_consent(self):
        if not self.privacy_consent:
            raise ValueError("Privacy policy consent is required")
        return self


class UserProfileUpdate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: str | None = Field(None, max_length=20)
    locality: str | None = Field(None, max_length=255)


class UserLogin(BaseModel):
    identifier: str  # Email or phone number
    password: str
    expected_role: str | None = None  # Optional check for role-specific portal login


class UserProfile(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: str
    role_display_ml: str
    role_display_en: str
    department_id: UUID | None = None
    department_name_ml: str | None = None
    department_name_en: str | None = None
    is_active: bool
    preferred_language: str = "ml"
    locality: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LanguagePreferenceUpdate(BaseModel):
    preferred_language: str = Field(..., pattern="^(ml|en)$")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserProfile


class RefreshTokenRequest(BaseModel):
    refresh_token: str
