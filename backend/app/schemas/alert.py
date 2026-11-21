import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlertCreate(BaseModel):
    title_ml: str = Field(..., max_length=255)
    title_en: str = Field(..., max_length=255)
    message_ml: str
    message_en: str
    alert_level: str = Field(default="WARNING", description="'INFO', 'WARNING', 'CRITICAL'")
    alert_source: str = Field(
        default="OFFICIAL_WARNING",
        description="'OFFICIAL_WARNING', 'COMMUNITY_REPORT', 'SIMULATED_DEMO_ALERT'",
    )
    affected_district: str | None = Field(None, max_length=100)
    expires_at: datetime | None = None


class AlertOut(BaseModel):
    id: uuid.UUID
    title_ml: str
    title_en: str
    message_ml: str
    message_en: str
    alert_level: str
    alert_source: str
    affected_district: str | None = None
    is_active: bool
    created_by: uuid.UUID
    creator_name: str | None = None
    expires_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    reference_type: str | None = None
    reference_id: uuid.UUID | None = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UnreadCountResponse(BaseModel):
    unread_count: int


class NotificationListResponse(BaseModel):
    unread_count: int
    notifications: list[NotificationOut]
