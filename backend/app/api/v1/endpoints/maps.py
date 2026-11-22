import hashlib
import math

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlalchemy import case, func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.complaint import Complaint
from app.models.location import Location
from app.schemas.complaint import (
    CATEGORY_ML_MAP,
    KERALA_MAX_LAT,
    KERALA_MAX_LON,
    KERALA_MIN_LAT,
    KERALA_MIN_LON,
    STATUS_ML_MAP,
)
from app.schemas.map import (
    GeoJsonFeature,
    GeoJsonFeatureCollection,
    MapClustersResponse,
    MapPoint,
    PublicMapSummary,
)

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
    active = public_reports.filter(
        Complaint.current_status.notin_(["RESOLVED", "REJECTED"])
    ).count()
    resolved = public_reports.filter(Complaint.current_status == "RESOLVED").count()
    category_counts = (
        db.query(
            Complaint.category,
            func.count(Complaint.id),
            func.sum(case((Complaint.current_status.notin_(["RESOLVED", "REJECTED"]), 1), else_=0)),
        )
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
        "active_categories": sum(1 for _, _, active_count in category_counts if active_count),
        "categories": [
            {"category": category, "count": count, "active_count": active_count or 0}
            for category, count, active_count in category_counts
        ],
        "recent_reports": [
            {
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


@router.get("/clusters", response_model=MapClustersResponse)
def get_map_clusters(
    min_lat: float | None = Query(None, description="Bounding box minimum latitude"),
    max_lat: float | None = Query(None, description="Bounding box maximum latitude"),
    min_lng: float | None = Query(None, description="Bounding box minimum longitude"),
    max_lng: float | None = Query(None, description="Bounding box maximum longitude"),
    category: str | None = Query(None, description="Filter by category"),
    status: str | None = Query(None, description="Filter by status (or ACTIVE)"),
    district: str | None = Query(None, description="Filter by Kerala district"),
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

    points: list[MapPoint] = []
    features: list[GeoJsonFeature] = []

    for c in complaints:
        if not c.location:
            continue

        cat_ml = CATEGORY_ML_MAP.get(c.category, c.category)
        st_ml = STATUS_ML_MAP.get(c.current_status, c.current_status)
        latitude = round(c.location.latitude, 2)
        longitude = round(c.location.longitude, 2)
        public_id = hashlib.sha256(
            f"{c.category}|{latitude:.2f}|{longitude:.2f}|{c.created_at.isoformat()}".encode()
        ).hexdigest()[:16]

        mp = MapPoint(
            id=public_id,
            category=c.category,
            category_display_ml=cat_ml,
            severity=c.severity,
            current_status=c.current_status,
            status_display_ml=st_ml,
            latitude=latitude,
            longitude=longitude,
            district=c.location.district,
            created_at=c.created_at,
        )
        points.append(mp)

        features.append(
            GeoJsonFeature(
                geometry={
                    "type": "Point",
                    "coordinates": [longitude, latitude],
                },
                properties={
                    "id": public_id,
                    "category": c.category,
                    "category_display_ml": cat_ml,
                    "severity": c.severity,
                    "current_status": c.current_status,
                    "status_display_ml": st_ml,
                    "district": c.location.district,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
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


@router.get("/nearby", response_model=list[MapPoint])
def get_nearby_complaints(
    lat: float = Query(..., description="Target point latitude"),
    lng: float = Query(..., description="Target point longitude"),
    radius_km: float = Query(10.0, ge=0.5, le=100.0, description="Search radius in kilometers"),
    category: str | None = Query(None, description="Optional category filter"),
    status: str | None = Query(None, description="Optional status filter"),
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
    lon_delta = (radius_km / (111.0 * (max(0.1, cos_lat)))) * 1.15

    query = (
        db.query(Complaint)
        .join(Complaint.location)
        .options(
            joinedload(Complaint.location),
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

    results: list[tuple[float, MapPoint]] = []
    for c in candidates:
        if not c.location:
            continue
        dist = haversine_distance_km(lat, lng, c.location.latitude, c.location.longitude)
        if dist <= radius_km:
            cat_ml = CATEGORY_ML_MAP.get(c.category, c.category)
            st_ml = STATUS_ML_MAP.get(c.current_status, c.current_status)
            latitude = round(c.location.latitude, 2)
            longitude = round(c.location.longitude, 2)
            public_id = hashlib.sha256(
                f"{c.category}|{latitude:.2f}|{longitude:.2f}|{c.created_at.isoformat()}".encode()
            ).hexdigest()[:16]
            mp = MapPoint(
                id=public_id,
                category=c.category,
                category_display_ml=cat_ml,
                severity=c.severity,
                current_status=c.current_status,
                status_display_ml=st_ml,
                latitude=latitude,
                longitude=longitude,
                district=c.location.district,
                created_at=c.created_at,
            )
            results.append((dist, mp))

    results.sort(key=lambda item: item[0])
    return [point for _, point in results[:limit]]
