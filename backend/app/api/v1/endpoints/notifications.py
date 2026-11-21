import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.alert import Notification
from app.schemas.alert import NotificationListResponse, NotificationOut, UnreadCountResponse
from app.schemas.auth import UserProfile

router = APIRouter()


@router.get("", response_model=NotificationListResponse)
def get_my_notifications(
    limit: int = 50,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch recent notifications for the logged in user along with unread count."""
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )

    unread_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .count()
    )

    return NotificationListResponse(
        unread_count=unread_count,
        notifications=notifications,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lightweight polling endpoint to retrieve total unread notifications count."""
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .count()
    )
    return UnreadCountResponse(unread_count=count)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    notification_id: uuid.UUID,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a specific notification as read."""
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="അറിയിപ്പ് കണ്ടെത്താൻ കഴിഞ്ഞില്ല (Notification not found)",
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read", response_model=UnreadCountResponse)
def mark_all_notifications_read(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all unread notifications as read for current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({Notification.is_read: True})
    db.commit()

    return UnreadCountResponse(unread_count=0)
