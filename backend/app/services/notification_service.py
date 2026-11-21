import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.alert import Notification
from app.schemas.complaint import STATUS_ML_MAP


def send_notification(
    db: Session,
    user_id: uuid.UUID,
    title: str,
    content: str,
    reference_type: str = "COMPLAINT",
    reference_id: Optional[uuid.UUID] = None,
) -> Notification:
    """Create a persistent in-app notification for a user."""
    notif = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        title=title,
        content=content,
        reference_type=reference_type,
        reference_id=reference_id,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def notify_status_change(
    db: Session,
    reporter_id: uuid.UUID,
    complaint_id: uuid.UUID,
    tracking_code: str,
    new_status: str,
    remarks: Optional[str] = None,
) -> Notification:
    """Notify the reporting citizen when their complaint status progresses."""
    status_ml = STATUS_ML_MAP.get(new_status, new_status)
    title = f"പരാതി അപ്‌ഡേറ്റ്: {status_ml} ({tracking_code})"
    content = f"താങ്കളുടെ പരാതി ({tracking_code}) യുടെ നില '{status_ml}' ആയി മാറ്റിയിരിക്കുന്നു."
    if remarks:
        content += f" കുറിപ്പ്: {remarks}"

    return send_notification(
        db=db,
        user_id=reporter_id,
        title=title,
        content=content,
        reference_type="COMPLAINT",
        reference_id=complaint_id,
    )


def notify_officer_assignment(
    db: Session,
    officer_id: uuid.UUID,
    reporter_id: uuid.UUID,
    complaint_id: uuid.UUID,
    tracking_code: str,
    instructions: Optional[str] = None,
) -> None:
    """Notify the assigned field officer and the citizen."""
    # 1. Notify Officer
    officer_title = f"പുതിയ ഫീൽഡ് ഇൻസ്പെക്ഷൻ ചുമതല ({tracking_code})"
    officer_content = f"പരാതി {tracking_code} താങ്കൾക്ക് അന്വേഷണത്തിനായി നൽകിയിരിക്കുന്നു."
    if instructions:
        officer_content += f" നിർദ്ദേശം: {instructions}"

    send_notification(
        db=db,
        user_id=officer_id,
        title=officer_title,
        content=officer_content,
        reference_type="COMPLAINT",
        reference_id=complaint_id,
    )

    # 2. Notify Citizen that officer has been assigned
    citizen_title = f"ഉദ്യോഗസ്ഥനെ ചുമതലപ്പെടുത്തി ({tracking_code})"
    citizen_content = f"താങ്കളുടെ പരാതി ({tracking_code}) പരിശോധിക്കാൻ ഫീൽഡ് ഓഫീസറെ ചുമതലപ്പെടുത്തിയിട്ടുണ്ട്."
    send_notification(
        db=db,
        user_id=reporter_id,
        title=citizen_title,
        content=citizen_content,
        reference_type="COMPLAINT",
        reference_id=complaint_id,
    )
