import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.alert import Alert, Notification
from app.models.auth import User
from app.schemas.alert import AlertCreate, AlertOut, PublicAlertOut
from app.schemas.auth import UserProfile

router = APIRouter()

VALID_ALERT_SOURCES = ["OFFICIAL_WARNING", "COMMUNITY_REPORT", "SIMULATED_DEMO_ALERT"]
VALID_ALERT_LEVELS = ["INFO", "WARNING", "CRITICAL"]


@router.get("", response_model=list[PublicAlertOut])
def get_active_alerts(
    district: str | None = Query(None, description="Filter by affected district"),
    include_all: bool = Query(False, description="Include inactive/expired alerts if true"),
    db: Session = Depends(get_db),
):
    """
    Public endpoint: Returns active environmental hazard alerts and broadcasts.
    Sorted by severity (CRITICAL first) and creation date.
    """
    now = datetime.now(UTC)
    query = db.query(Alert)

    # Only authority-issued warnings are public announcements. Community and
    # simulated alerts stay internal and are never presented as official news.
    query = query.filter(Alert.alert_source == "OFFICIAL_WARNING")

    if not include_all:
        query = query.filter(Alert.is_active == True)
        query = query.filter((Alert.expires_at == None) | (Alert.expires_at > now))

    if district and district != "ALL":
        query = query.filter(
            (Alert.affected_district == district)
            | (Alert.affected_district == None)
            | (Alert.affected_district == "ALL")
        )

    # Custom ordering: CRITICAL > WARNING > INFO
    alerts = query.order_by(
        Alert.alert_level == "CRITICAL",
        Alert.alert_level == "WARNING",
        Alert.created_at.desc(),
    ).all()

    results = []
    for a in alerts:
        results.append(
            PublicAlertOut(
                id=a.id,
                title_ml=a.title_ml,
                title_en=a.title_en,
                message_ml=a.message_ml,
                message_en=a.message_en,
                alert_level=a.alert_level,
                alert_source=a.alert_source,
                affected_district=a.affected_district,
                is_active=a.is_active,
                expires_at=a.expires_at,
                created_at=a.created_at,
            )
        )
    return results


@router.post("", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
def broadcast_alert(
    payload: AlertCreate,
    current_user: UserProfile = Depends(require_role(["AUTHORITY", "SUPER_ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Broadcast a new official environmental alert.
    Restricted to Authority officers and Super Admins.
    Enforces valid alert sources and levels.
    """
    if payload.alert_source not in VALID_ALERT_SOURCES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"അസാധുവായ അലേർട്ട് സ്രോതസ്സ്. സാധുവായവ: {', '.join(VALID_ALERT_SOURCES)}",
        )

    if payload.alert_level not in VALID_ALERT_LEVELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"അസാധുവായ ലെവൽ. സാധുവായവ: {', '.join(VALID_ALERT_LEVELS)}",
        )

    alert = Alert(
        id=uuid.uuid4(),
        title_ml=payload.title_ml.strip(),
        title_en=payload.title_en.strip(),
        message_ml=payload.message_ml.strip(),
        message_en=payload.message_en.strip(),
        alert_level=payload.alert_level,
        alert_source=payload.alert_source,
        affected_district=payload.affected_district,
        expires_at=payload.expires_at,
        created_by=current_user.id,
        is_active=True,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Automatically broadcast in-app notification to all active users
    active_users = db.query(User).filter(User.is_active == True).all()
    notifications = [
        Notification(
            id=uuid.uuid4(),
            user_id=u.id,
            title=f"അടിയന്തര മുന്നറിയിപ്പ്: {alert.title_ml}",
            content=alert.message_ml,
            reference_type="ALERT",
            reference_id=alert.id,
            is_read=False,
        )
        for u in active_users
    ]
    if notifications:
        db.add_all(notifications)
        db.commit()

    return AlertOut(
        id=alert.id,
        title_ml=alert.title_ml,
        title_en=alert.title_en,
        message_ml=alert.message_ml,
        message_en=alert.message_en,
        alert_level=alert.alert_level,
        alert_source=alert.alert_source,
        affected_district=alert.affected_district,
        is_active=alert.is_active,
        created_by=alert.created_by,
        creator_name=current_user.full_name,
        expires_at=alert.expires_at,
        created_at=alert.created_at,
    )


@router.patch("/{alert_id}/deactivate", response_model=AlertOut)
def deactivate_alert(
    alert_id: uuid.UUID,
    current_user: UserProfile = Depends(require_role(["AUTHORITY", "SUPER_ADMIN"])),
    db: Session = Depends(get_db),
):
    """Deactivate an existing active broadcast alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="അലേർട്ട് കണ്ടെത്താൻ കഴിഞ്ഞില്ല (Alert not found)",
        )

    alert.is_active = False
    db.commit()
    db.refresh(alert)

    return AlertOut(
        id=alert.id,
        title_ml=alert.title_ml,
        title_en=alert.title_en,
        message_ml=alert.message_ml,
        message_en=alert.message_en,
        alert_level=alert.alert_level,
        alert_source=alert.alert_source,
        affected_district=alert.affected_district,
        is_active=alert.is_active,
        created_by=alert.created_by,
        creator_name=alert.creator.full_name if alert.creator else None,
        expires_at=alert.expires_at,
        created_at=alert.created_at,
    )
