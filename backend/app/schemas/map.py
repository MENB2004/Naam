from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class MapPoint(BaseModel):
    id: str
    category: str
    category_display_ml: str
    severity: str
    current_status: str
    status_display_ml: str
    latitude: float
    longitude: float
    district: str
    created_at: datetime

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
    active_count: int


class PublicRecentReport(BaseModel):
    category: str
    current_status: str
    district: str
    created_at: datetime


class PublicMapSummary(BaseModel):
    total_complaints: int
    active_complaints: int
    resolved_complaints: int
    active_categories: int
    categories: list[PublicCategoryCount]
    recent_reports: list[PublicRecentReport]
