import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class SafeGeometry(Geometry):
    def bind_expression(self, bindvalue):
        # On PostgreSQL, PostGIS handles ST_GeomFromEWKT.
        # For cross-database and local testing compatibility, avoid wrapping NULLs.
        return bindvalue


class Location(Base):
    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(
        SafeGeometry(geometry_type="POINT", srid=4326, spatial_index=False), nullable=True
    )
    district = Column(String(100), nullable=False, index=True)
    lsgd_type = Column(
        String(50), nullable=False
    )  # 'GRAMA_PANCHAYAT', 'MUNICIPALITY', 'CORPORATION'
    lsgd_name = Column(String(150), nullable=False)
    ward_number = Column(String(10), nullable=True)
    landmark = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    complaint = relationship("Complaint", back_populates="location", uselist=False)
