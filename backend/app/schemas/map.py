import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class MapPoint(BaseModel):
    id: uuid.UUID
    tracking_code: str
    title: str
    category: str
    category_display_ml: str
    severity: str
    current_status: str
    status_display_ml: str
    latitude: float
    longitude: float
    district: str
    lsgd_name: str
    ward_number: str | None = None
    created_at: datetime
    thumbnail_url: str | None = None
    distance_km: float | None = None

    model_config = ConfigDict(from_attributes=True)


class GeoJsonFeature(BaseModel):
    type: str = "Feature"
    geometry: dict[str, Any]
    properties: dict[str, Any]


class GeoJsonFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[GeoJsonFeature]
    total_count: int


class MapClustersResponse(BaseModel):
    total_count: int
    points: list[MapPoint]
    geojson: GeoJsonFeatureCollection


class PublicCategoryCount(BaseModel):
    category: str
    count: int


class PublicRecentReport(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    current_status: str
    district: str
    created_at: datetime


class PublicMapSummary(BaseModel):
    total_complaints: int
    active_complaints: int
    resolved_complaints: int
    active_departments: int
    categories: list[PublicCategoryCount]
    recent_reports: list[PublicRecentReport]
