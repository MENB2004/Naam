from typing import List, Optional
from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_complaints: int
    resolved_complaints: int
    in_progress_complaints: int
    pending_complaints: int
    resolution_rate: float
    average_resolution_hours: float
    active_alerts: int


class CategoryDistribution(BaseModel):
    category: str
    category_name_ml: str
    category_name_en: str
    count: int
    percentage: float
    color: str


class DistrictMetric(BaseModel):
    district: str
    district_name_ml: str
    total: int
    resolved: int
    pending: int
    resolution_rate: float


class TrendPoint(BaseModel):
    date: str
    reported: int
    resolved: int


class AnalyticsSummaryResponse(BaseModel):
    overview: AnalyticsOverview
    categories: List[CategoryDistribution]
    districts: List[DistrictMetric]
    trends: List[TrendPoint]
