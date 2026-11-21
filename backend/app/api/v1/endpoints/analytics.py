import csv
import io
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.complaint import Complaint, ComplaintUpdate
from app.models.location import Location
from app.models.alert import Alert
from app.schemas.analytics import (
    AnalyticsOverview,
    CategoryDistribution,
    DistrictMetric,
    TrendPoint,
    AnalyticsSummaryResponse,
)

router = APIRouter()

CATEGORY_META = {
    "WASTE": {"name_ml": "മാലിന്യ പ്രശ്നങ്ങൾ", "name_en": "Waste Management", "color": "#059669"},
    "WATER_POLLUTION": {"name_ml": "ജലമലിനീകരണം", "name_en": "Water Pollution", "color": "#0284c7"},
    "DRAINAGE": {"name_ml": "ഡ്രെയിനേജ് തടസ്സങ്ങൾ", "name_en": "Drainage & Sewage", "color": "#d97706"},
    "FLOODING": {"name_ml": "വെള്ളപ്പൊക്കം / വെള്ളക്കെട്ട്", "name_en": "Flooding", "color": "#2563eb"},
    "AIR_POLLUTION": {"name_ml": "വായുമലിനീകരണം", "name_en": "Air Pollution", "color": "#7c3aed"},
    "DEFORESTATION": {"name_ml": "വൃക്ഷങ്ങൾ മുറിക്കൽ", "name_en": "Deforestation", "color": "#16a34a"},
    "ILLEGAL_MINING": {"name_ml": "അനധികൃത ഖനനം", "name_en": "Illegal Mining", "color": "#dc2626"},
    "OTHER": {"name_ml": "മറ്റു പ്രശ്നങ്ങൾ", "name_en": "Other Issues", "color": "#64748b"},
}

KERALA_DISTRICTS = {
    "Thiruvananthapuram": "തിരുവനന്തപുരം",
    "Kollam": "കൊല്ലം",
    "Pathanamthitta": "പത്തനംതിട്ട",
    "Alappuzha": "ആലപ്പുഴ",
    "Kottayam": "കോട്ടയം",
    "Idukki": "ഇടുക്കി",
    "Ernakulam": "എറണാകുളം",
    "Thrissur": "തൃശ്ശൂർ",
    "Palakkad": "പാലക്കാട്",
    "Malappuram": "മലപ്പുറം",
    "Kozhikode": "കോഴിക്കോട്",
    "Wayanad": "വയനാട്",
    "Kannur": "കണ്ണൂർ",
    "Kasaragod": "കാസർഗോഡ്",
}


def compute_overview_data(db: Session) -> AnalyticsOverview:
    total_complaints = db.query(func.count(Complaint.id)).scalar() or 0
    resolved_complaints = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.current_status == "RESOLVED")
        .scalar()
        or 0
    )
    in_progress_complaints = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.current_status.in_(["IN_PROGRESS", "ASSIGNED"]))
        .scalar()
        or 0
    )
    pending_complaints = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.current_status.in_(["SUBMITTED", "VERIFIED"]))
        .scalar()
        or 0
    )

    resolution_rate = (
        round((resolved_complaints / total_complaints) * 100.0, 1)
        if total_complaints > 0
        else 0.0
    )

    # Calculate average resolution time across resolved complaints
    resolved_records = (
        db.query(Complaint.created_at, Complaint.updated_at)
        .filter(Complaint.current_status == "RESOLVED")
        .all()
    )

    avg_hours = 0.0
    if resolved_records:
        durations = []
        for created, updated in resolved_records:
            if created and updated:
                diff = (updated - created).total_seconds() / 3600.0
                if diff >= 0:
                    durations.append(diff)
        if durations:
            avg_hours = round(sum(durations) / len(durations), 1)

    active_alerts = (
        db.query(func.count(Alert.id)).filter(Alert.is_active == True).scalar() or 0
    )

    return AnalyticsOverview(
        total_complaints=total_complaints,
        resolved_complaints=resolved_complaints,
        in_progress_complaints=in_progress_complaints,
        pending_complaints=pending_complaints,
        resolution_rate=resolution_rate,
        average_resolution_hours=avg_hours,
        active_alerts=active_alerts,
    )


def compute_categories_data(db: Session) -> List[CategoryDistribution]:
    total_count = db.query(func.count(Complaint.id)).scalar() or 0
    rows = (
        db.query(Complaint.category, func.count(Complaint.id))
        .group_by(Complaint.category)
        .all()
    )
    counts = {cat: count for cat, count in rows}

    distributions = []
    # Include all known categories first
    known_cats = set(CATEGORY_META.keys())
    for cat_key, meta in CATEGORY_META.items():
        cnt = counts.get(cat_key, 0)
        pct = round((cnt / total_count * 100.0), 1) if total_count > 0 else 0.0
        distributions.append(
            CategoryDistribution(
                category=cat_key,
                category_name_ml=meta["name_ml"],
                category_name_en=meta["name_en"],
                count=cnt,
                percentage=pct,
                color=meta["color"],
            )
        )

    # Any unexpected categories from dynamic data
    for cat_key, cnt in counts.items():
        if cat_key not in known_cats:
            pct = round((cnt / total_count * 100.0), 1) if total_count > 0 else 0.0
            distributions.append(
                CategoryDistribution(
                    category=cat_key,
                    category_name_ml=cat_key,
                    category_name_en=cat_key,
                    count=cnt,
                    percentage=pct,
                    color="#64748b",
                )
            )

    return distributions


def compute_districts_data(db: Session) -> List[DistrictMetric]:
    results = (
        db.query(
            Location.district,
            func.count(Complaint.id).label("total"),
            func.sum(
                case((Complaint.current_status == "RESOLVED", 1), else_=0)
            ).label("resolved"),
        )
        .join(Complaint, Complaint.location_id == Location.id)
        .group_by(Location.district)
        .all()
    )

    data_map = {}
    for district, total, resolved in results:
        tot = total or 0
        res = resolved or 0
        pend = tot - res
        rate = round((res / tot * 100.0), 1) if tot > 0 else 0.0
        data_map[district] = {
            "total": tot,
            "resolved": res,
            "pending": pend,
            "resolution_rate": rate,
        }

    metrics = []
    for dist_en, dist_ml in KERALA_DISTRICTS.items():
        d_data = data_map.get(
            dist_en,
            {"total": 0, "resolved": 0, "pending": 0, "resolution_rate": 0.0},
        )
        metrics.append(
            DistrictMetric(
                district=dist_en,
                district_name_ml=dist_ml,
                total=d_data["total"],
                resolved=d_data["resolved"],
                pending=d_data["pending"],
                resolution_rate=d_data["resolution_rate"],
            )
        )

    # Sort by total descending, then district name
    metrics.sort(key=lambda m: (-m.total, m.district))
    return metrics


def compute_trends_data(db: Session, days: int = 14) -> List[TrendPoint]:
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days - 1)

    complaints = (
        db.query(Complaint.created_at, Complaint.current_status, Complaint.updated_at)
        .filter(Complaint.created_at >= start_date)
        .all()
    )

    day_buckets = {}
    for i in range(days):
        day_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        day_buckets[day_str] = {"reported": 0, "resolved": 0}

    for comp in complaints:
        if comp.created_at:
            created_str = comp.created_at.strftime("%Y-%m-%d")
            if created_str in day_buckets:
                day_buckets[created_str]["reported"] += 1

        if comp.current_status == "RESOLVED" and comp.updated_at:
            res_str = comp.updated_at.strftime("%Y-%m-%d")
            if res_str in day_buckets:
                day_buckets[res_str]["resolved"] += 1

    return [
        TrendPoint(date=d, reported=v["reported"], resolved=v["resolved"])
        for d, v in sorted(day_buckets.items())
    ]


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Aggregate high-level overview metrics across all complaints and alerts."""
    return compute_overview_data(db)


@router.get("/categories", response_model=List[CategoryDistribution])
def get_category_distribution(db: Session = Depends(get_db)):
    """Environmental complaint breakdown by category with bilingual metadata."""
    return compute_categories_data(db)


@router.get("/districts", response_model=List[DistrictMetric])
def get_district_metrics(db: Session = Depends(get_db)):
    """District performance and resolution rate across all 14 Kerala districts."""
    return compute_districts_data(db)


@router.get("/trends", response_model=List[TrendPoint])
def get_resolution_trends(
    days: int = Query(default=14, ge=7, le=90), db: Session = Depends(get_db)
):
    """Daily intake vs resolution trends over a specified period."""
    return compute_trends_data(db, days=days)


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    days: int = Query(default=14, ge=7, le=90), db: Session = Depends(get_db)
):
    """Combined analytical dashboard payload in a single payload for maximum performance."""
    return AnalyticsSummaryResponse(
        overview=compute_overview_data(db),
        categories=compute_categories_data(db),
        districts=compute_districts_data(db),
        trends=compute_trends_data(db, days=days),
    )


@router.get("/export")
def export_environmental_report(
    format: str = Query(default="csv", pattern="^(csv|json)$"),
    db: Session = Depends(get_db),
):
    """Export environmental complaint dataset in CSV or JSON format for reporting and analysis."""
    query = (
        db.query(Complaint, Location)
        .join(Location, Complaint.location_id == Location.id)
        .order_by(Complaint.created_at.desc())
    )
    records = query.all()

    if format == "json":
        data = [
            {
                "tracking_code": comp.tracking_code,
                "title": comp.title,
                "category": comp.category,
                "severity": comp.severity,
                "status": comp.current_status,
                "district": loc.district,
                "lsgd_type": loc.lsgd_type,
                "lsgd_name": loc.lsgd_name,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "created_at": comp.created_at.isoformat() if comp.created_at else None,
                "updated_at": comp.updated_at.isoformat() if comp.updated_at else None,
            }
            for comp, loc in records
        ]
        return data

    # Default CSV
    output = io.StringIO()
    # Write BOM for UTF-8 Excel support
    output.write("\ufeff")
    writer = csv.writer(output)

    writer.writerow(
        [
            "ട്രാക്കിംഗ് കോഡ് (Tracking Code)",
            "ശീർഷകം (Title)",
            "വിഭാഗം (Category)",
            "തീവ്രത (Severity)",
            "നിലവിലെ അവസ്ഥ (Status)",
            "ജില്ല (District)",
            "തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം (LSGD Type)",
            "സ്ഥാപനത്തിന്റെ പേര് (LSGD Name)",
            "അക്ഷാംശം (Latitude)",
            "രേഖാംശം (Longitude)",
            "സമർപ്പിച്ച തീയതി (Created At)",
            "അവസാനം പുതുക്കിയത് (Updated At)",
        ]
    )

    for comp, loc in records:
        writer.writerow(
            [
                comp.tracking_code,
                comp.title,
                comp.category,
                comp.severity,
                comp.current_status,
                loc.district,
                loc.lsgd_type,
                loc.lsgd_name,
                loc.latitude,
                loc.longitude,
                comp.created_at.strftime("%Y-%m-%d %H:%M:%S") if comp.created_at else "",
                comp.updated_at.strftime("%Y-%m-%d %H:%M:%S") if comp.updated_at else "",
            ]
        )

    filename = f"naam_environmental_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
