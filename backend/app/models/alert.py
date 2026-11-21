import uuid
from sqlalchemy import Boolean, Column, ForeignKey, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title_ml = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=False)
    message_ml = Column(Text, nullable=False)
    message_en = Column(Text, nullable=False)
    alert_level = Column(String(20), default="WARNING", nullable=False)  # 'INFO', 'WARNING', 'CRITICAL'
    alert_source = Column(String(30), default="OFFICIAL_WARNING", nullable=False)  # 'OFFICIAL_WARNING', 'COMMUNITY_REPORT', 'SIMULATED_DEMO_ALERT'
    affected_district = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    creator = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    reference_type = Column(String(50), nullable=True)  # 'COMPLAINT', 'ALERT'
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User")
