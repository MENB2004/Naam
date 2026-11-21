import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.complaint import CATEGORY_ML_MAP, STATUS_ML_MAP


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
    ward_number: Optional[str] = None
    created_at: datetime
    thumbnail_url: Optional[str] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class GeoJsonFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class GeoJsonFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJsonFeature]
    total_count: int


class MapClustersResponse(BaseModel):
    total_count: int
    points: List[MapPoint]
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
    categories: List[PublicCategoryCount]
    recent_reports: List[PublicRecentReport]
