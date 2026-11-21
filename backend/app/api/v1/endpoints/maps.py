import math
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.complaint import Complaint, Evidence
from app.models.location import Location
from app.models.department import Department
from app.schemas.complaint import CATEGORY_ML_MAP, STATUS_ML_MAP, KERALA_MIN_LAT, KERALA_MAX_LAT, KERALA_MIN_LON, KERALA_MAX_LON
from app.schemas.map import MapPoint, MapClustersResponse, GeoJsonFeature, GeoJsonFeatureCollection, PublicMapSummary

router = APIRouter()


@router.get("/summary", response_model=PublicMapSummary)
def get_public_map_summary(db: Session = Depends(get_db)):
    """Return aggregate metrics and sanitized recent reports visible on the public map."""
    public_reports = (
        db.query(Complaint)
        .join(Complaint.location)
        .filter(
            Complaint.is_public.is_(True),
            Location.latitude >= KERALA_MIN_LAT,
            Location.latitude <= KERALA_MAX_LAT,
            Location.longitude >= KERALA_MIN_LON,
            Location.longitude <= KERALA_MAX_LON,
        )
    )
    total = public_reports.count()
    active = public_reports.filter(Complaint.current_status.notin_(["RESOLVED", "REJECTED"])).count()
    resolved = public_reports.filter(Complaint.current_status == "RESOLVED").count()
    category_counts = (
        db.query(Complaint.category, func.count(Complaint.id))
        .join(Complaint.location)
        .filter(
            Complaint.is_public.is_(True),
            Location.latitude >= KERALA_MIN_LAT,
            Location.latitude <= KERALA_MAX_LAT,
            Location.longitude >= KERALA_MIN_LON,
            Location.longitude <= KERALA_MAX_LON,
        )
        .group_by(Complaint.category)
        .all()
    )
    latest = (
        db.query(Complaint, Location.district)
        .join(Complaint.location)
        .filter(
            Complaint.is_public.is_(True),
            Location.latitude >= KERALA_MIN_LAT,
            Location.latitude <= KERALA_MAX_LAT,
            Location.longitude >= KERALA_MIN_LON,
            Location.longitude <= KERALA_MAX_LON,
        )
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )
    return {
        "total_complaints": total,
        "active_complaints": active,
        "resolved_complaints": resolved,
        "active_departments": db.query(Department).filter(Department.is_active.is_(True)).count(),
        "categories": [{"category": category, "count": count} for category, count in category_counts],
        "recent_reports": [
            {
                "id": complaint.id,
                "title": complaint.title,
                "category": complaint.category,
                "current_status": complaint.current_status,
                "district": district,
                "created_at": complaint.created_at,
            }
            for complaint, district in latest
        ],
    }


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in km."""
    r = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.asin(math.sqrt(a))
    return r * c


def get_first_image_url(evidence_list: List[Evidence]) -> Optional[str]:
    for ev in evidence_list:
        if ev.file_type and ev.file_type.startswith("image/"):
            return ev.file_url
        if ev.file_url and any(ev.file_url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            return ev.file_url
    if evidence_list:
        return evidence_list[0].file_url
    return None


@router.get("/clusters", response_model=MapClustersResponse)
def get_map_clusters(
    min_lat: Optional[float] = Query(None, description="Bounding box minimum latitude"),
    max_lat: Optional[float] = Query(None, description="Bounding box maximum latitude"),
    min_lng: Optional[float] = Query(None, description="Bounding box minimum longitude"),
    max_lng: Optional[float] = Query(None, description="Bounding box maximum longitude"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status (or ACTIVE)"),
    district: Optional[str] = Query(None, description="Filter by Kerala district"),
    limit: int = Query(300, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Public interactive map endpoint: returns sanitized public complaints inside
    the Kerala geographic boundary, supporting bounding-box filtering, category,
    and status filters. Excludes all citizen PII.
    """
    query = (
        db.query(Complaint)
        .join(Complaint.location)
        .options(
            joinedload(Complaint.location),
            joinedload(Complaint.evidence),
        )
        .filter(Complaint.is_public == True)
    )

    # Kerala geographic coordinate constraints
    query = query.filter(
        Location.latitude >= KERALA_MIN_LAT,
        Location.latitude <= KERALA_MAX_LAT,
        Location.longitude >= KERALA_MIN_LON,
        Location.longitude <= KERALA_MAX_LON,
    )

    # Optional bounding box viewport clipping
    if min_lat is not None:
        query = query.filter(Location.latitude >= min_lat)
    if max_lat is not None:
        query = query.filter(Location.latitude <= max_lat)
    if min_lng is not None:
        query = query.filter(Location.longitude >= min_lng)
    if max_lng is not None:
        query = query.filter(Location.longitude <= max_lng)

    # Optional attribute filters
    if category and category != "ALL":
        query = query.filter(Complaint.category == category)

    if status and status != "ALL":
        if status == "ACTIVE":
            query = query.filter(Complaint.current_status.notin_(["RESOLVED", "REJECTED"]))
        else:
            query = query.filter(Complaint.current_status == status)

    if district and district != "ALL":
        query = query.filter(Location.district == district)

    complaints = query.order_by(Complaint.created_at.desc()).limit(limit).all()

    points: List[MapPoint] = []
    features: List[GeoJsonFeature] = []

    for c in complaints:
        if not c.location:
            continue

        thumb = get_first_image_url(c.evidence or [])
        cat_ml = CATEGORY_ML_MAP.get(c.category, c.category)
        st_ml = STATUS_ML_MAP.get(c.current_status, c.current_status)

        mp = MapPoint(
            id=c.id,
            tracking_code=c.tracking_code,
            title=c.title,
            category=c.category,
            category_display_ml=cat_ml,
            severity=c.severity,
            current_status=c.current_status,
            status_display_ml=st_ml,
            latitude=c.location.latitude,
            longitude=c.location.longitude,
            district=c.location.district,
            lsgd_name=c.location.lsgd_name,
            ward_number=c.location.ward_number,
            created_at=c.created_at,
            thumbnail_url=thumb,
        )
        points.append(mp)

        features.append(
            GeoJsonFeature(
                geometry={
                    "type": "Point",
                    "coordinates": [c.location.longitude, c.location.latitude],
                },
                properties={
                    "id": str(c.id),
                    "tracking_code": c.tracking_code,
                    "title": c.title,
                    "category": c.category,
                    "category_display_ml": cat_ml,
                    "severity": c.severity,
                    "current_status": c.current_status,
                    "status_display_ml": st_ml,
                    "district": c.location.district,
                    "lsgd_name": c.location.lsgd_name,
                    "ward_number": c.location.ward_number,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "thumbnail_url": thumb,
                },
            )
        )

    return MapClustersResponse(
        total_count=len(points),
        points=points,
        geojson=GeoJsonFeatureCollection(
            features=features,
            total_count=len(features),
        ),
    )


@router.get("/nearby", response_model=List[MapPoint])
def get_nearby_complaints(
    lat: float = Query(..., description="Target point latitude"),
    lng: float = Query(..., description="Target point longitude"),
    radius_km: float = Query(10.0, ge=0.5, le=100.0, description="Search radius in kilometers"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    status: Optional[str] = Query(None, description="Optional status filter"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """
    Radial proximity search: returns public complaints within `radius_km` of given (lat, lng),
    sorted by closest distance. Strips all personal citizen identifiers.
    """
    if not (KERALA_MIN_LAT <= lat <= KERALA_MAX_LAT and KERALA_MIN_LON <= lng <= KERALA_MAX_LON):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="തിരഞ്ഞെടുത്ത ലൊക്കേഷൻ കേരളത്തിന് പുറത്താണ് (Coordinates outside Kerala)",
        )

    # Approximate bounding box degrees to pre-filter before exact Haversine calculation
    # 1 deg lat ≈ 111 km; 1 deg lon ≈ 111 * cos(lat) km
    lat_delta = (radius_km / 111.0) * 1.15
    cos_lat = math.cos(math.radians(lat))
    lon_delta = (radius_km / (111.0 * (cos_lat if cos_lat > 0.1 else 0.1))) * 1.15

    query = (
        db.query(Complaint)
        .join(Complaint.location)
        .options(
            joinedload(Complaint.location),
            joinedload(Complaint.evidence),
        )
        .filter(
            Complaint.is_public == True,
            Location.latitude >= lat - lat_delta,
            Location.latitude <= lat + lat_delta,
            Location.longitude >= lng - lon_delta,
            Location.longitude <= lng + lon_delta,
        )
    )

    if category and category != "ALL":
        query = query.filter(Complaint.category == category)

    if status and status != "ALL":
        if status == "ACTIVE":
            query = query.filter(Complaint.current_status.notin_(["RESOLVED", "REJECTED"]))
        else:
            query = query.filter(Complaint.current_status == status)

    candidates = query.all()

    results: List[MapPoint] = []
    for c in candidates:
        if not c.location:
            continue
        dist = haversine_distance_km(lat, lng, c.location.latitude, c.location.longitude)
        if dist <= radius_km:
            cat_ml = CATEGORY_ML_MAP.get(c.category, c.category)
            st_ml = STATUS_ML_MAP.get(c.current_status, c.current_status)
            thumb = get_first_image_url(c.evidence or [])
            mp = MapPoint(
                id=c.id,
                tracking_code=c.tracking_code,
                title=c.title,
                category=c.category,
                category_display_ml=cat_ml,
                severity=c.severity,
                current_status=c.current_status,
                status_display_ml=st_ml,
                latitude=c.location.latitude,
                longitude=c.location.longitude,
                district=c.location.district,
                lsgd_name=c.location.lsgd_name,
                ward_number=c.location.ward_number,
                created_at=c.created_at,
                thumbnail_url=thumb,
                distance_km=round(dist, 2),
            )
            results.append(mp)

    results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999.0)
    return results[:limit]
