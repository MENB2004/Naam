import uuid
from sqlalchemy import Boolean, Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # 'LSGD', 'SUCHITWA', 'KSPCB', 'IRRIGATION'
    name_ml = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=False)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    users = relationship("User", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")
