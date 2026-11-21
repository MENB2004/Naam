import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.auth import Role, User, UserRole
from app.models.complaint import Complaint, ComplaintAssignment, ComplaintUpdate, Evidence
from app.models.location import Location
from app.schemas.complaint import (
    CATEGORY_ML_MAP,
    STATUS_ML_MAP,
    AssignmentCreate,
    ComplaintCreate,
    ComplaintOut,
    ComplaintUpdateOut,
    OfficerOut,
    ResolutionProofCreate,
    StatusUpdatePayload,
)
from app.services.complaint_state_machine import validate_status_transition
from app.services.notification_service import notify_officer_assignment, notify_status_change

router = APIRouter()

COMPLAINT_LOAD_OPTIONS = [
    selectinload(Complaint.reporter),
    selectinload(Complaint.department),
    selectinload(Complaint.location),
    selectinload(Complaint.evidence),
    selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
    selectinload(Complaint.assignments).selectinload(ComplaintAssignment.assignee),
    selectinload(Complaint.assignments).selectinload(ComplaintAssignment.assigner),
]


def generate_unique_tracking_code(db: Session) -> str:
    """Generate a citizen-friendly unique tracking code: NAAM-2026-XXXXX."""
    for _ in range(10):
        code_number = secrets.randbelow(90000) + 10000
        tracking_code = f"NAAM-2026-{code_number}"
        exists = db.scalars(
            select(Complaint.id).where(Complaint.tracking_code == tracking_code)
        ).first()
        if not exists:
            return tracking_code
    return f"NAAM-2026-{uuid.uuid4().hex[:6].upper()}"


def serialize_complaint(c: Complaint) -> ComplaintOut:
    return ComplaintOut(
        id=c.id,
        tracking_code=c.tracking_code,
        title=c.title,
        description=c.description,
        category=c.category,
        category_display_ml=CATEGORY_ML_MAP.get(c.category, c.category),
        severity=c.severity,
        current_status=c.current_status,
        status_display_ml=STATUS_ML_MAP.get(c.current_status, c.current_status),
        reporter_id=c.reporter_id,
        reporter_name=c.reporter.full_name if c.reporter else None,
        department_id=c.department_id,
        department_name_ml=c.department.name_ml if c.department else None,
        created_at=c.created_at,
        updated_at=c.updated_at,
        location=c.location,
        evidence=c.evidence or [],
        updates=[
            {
                "id": u.id,
                "previous_status": u.previous_status,
                "new_status": u.new_status,
                "remarks": u.remarks,
                "created_at": u.created_at,
                "author_name": u.author.full_name if u.author else "സിസ്റ്റം",
            }
            for u in (c.updates or [])
        ],
        assignments=[
            {
                "id": a.id,
                "complaint_id": a.complaint_id,
                "assigned_by_id": a.assigned_by,
                "assigned_by_name": a.assigner.full_name if a.assigner else None,
                "assigned_to_id": a.assigned_to,
                "assigned_to_name": a.assignee.full_name if a.assignee else None,
                "instructions": a.instructions,
                "deadline": a.deadline,
                "status": a.status,
                "created_at": a.created_at,
            }
            for a in (c.assignments or [])
        ],
    )


@router.post(
    "", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED, tags=["Complaints"]
)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new geo-tagged environmental complaint with photo evidence."""
    # 1. Create Location record
    loc_data = complaint_in.location
    geom_val = None
    if db.bind and db.bind.dialect.name == "postgresql":
        from geoalchemy2.elements import WKTElement

        geom_val = WKTElement(f"POINT({loc_data.longitude} {loc_data.latitude})", srid=4326)

    location = Location(
        id=uuid.uuid4(),
        latitude=loc_data.latitude,
        longitude=loc_data.longitude,
        geom=geom_val,
        district=loc_data.district,
        lsgd_type=loc_data.lsgd_type,
        lsgd_name=loc_data.lsgd_name,
        ward_number=loc_data.ward_number,
        landmark=loc_data.landmark,
    )
    db.add(location)
    db.flush()

    # 2. Create Complaint record
    tracking_code = generate_unique_tracking_code(db)
    complaint = Complaint(
        id=uuid.uuid4(),
        tracking_code=tracking_code,
        title=complaint_in.title,
        description=complaint_in.description,
        category=complaint_in.category,
        severity=complaint_in.severity,
        current_status="SUBMITTED",
        reporter_id=current_user.id,
        location_id=location.id,
        is_public=True,
    )
    db.add(complaint)
    db.flush()

    # 3. Create Evidence records
    if complaint_in.evidence:
        for ev in complaint_in.evidence:
            evidence_obj = Evidence(
                id=uuid.uuid4(),
                complaint_id=complaint.id,
                uploaded_by=current_user.id,
                file_url=ev.file_url,
                file_type=ev.file_type,
                file_size_bytes=ev.file_size_bytes,
                evidence_type=ev.evidence_type,
            )
            db.add(evidence_obj)

    # 4. Create initial Audit History Update
    initial_update = ComplaintUpdate(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        changed_by=current_user.id,
        previous_status="NONE",
        new_status="SUBMITTED",
        remarks="പരാതി വിജയകരമായി രജിസ്റ്റർ ചെയ്തു. ബന്ധപ്പെട്ട വകുപ്പിലേക്ക് പരിശോധനയ്ക്കായി കൈമാറുന്നു.",
    )
    db.add(initial_update)
    db.commit()

    # Reload with relationships
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.reporter),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
            selectinload(Complaint.evidence),
            selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
        )
        .where(Complaint.id == complaint.id)
    )
    loaded = db.scalars(stmt).first()
    return serialize_complaint(loaded)


@router.get("/me", response_model=list[ComplaintOut], tags=["Complaints"])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all complaints submitted by the authenticated citizen."""
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.reporter),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
            selectinload(Complaint.evidence),
            selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
        )
        .where(Complaint.reporter_id == current_user.id)
        .order_by(desc(Complaint.created_at))
    )
    results = db.scalars(stmt).all()
    return [serialize_complaint(c) for c in results]


@router.get("/track/{tracking_code}", response_model=ComplaintOut, tags=["Complaints"])
def track_complaint(
    tracking_code: str,
    db: Session = Depends(get_db),
):
    """Public lookup endpoint allowing citizens to track progress by tracking code."""
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.reporter),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
            selectinload(Complaint.evidence),
            selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
        )
        .where(Complaint.tracking_code == tracking_code.strip().upper())
    )
    complaint = db.scalars(stmt).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ഈ ട്രാക്കിംഗ് കോഡിൽ പരാതി കണ്ടെത്തിയില്ല (Complaint not found with this tracking code)",
        )
    return serialize_complaint(complaint)


@router.get("", response_model=list[ComplaintOut], tags=["Complaints"])
def list_public_complaints(
    category: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    district: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List public complaints with optional category and district filters."""
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.reporter),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
            selectinload(Complaint.evidence),
            selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
        )
        .join(Complaint.location)
        .where(Complaint.is_public == True)
    )

    if category:
        stmt = stmt.where(Complaint.category == category)
    if status_filter:
        stmt = stmt.where(Complaint.current_status == status_filter)
    if district:
        stmt = stmt.where(Location.district == district)

    stmt = stmt.order_by(desc(Complaint.created_at)).limit(limit).offset(offset)
    results = db.scalars(stmt).all()
    return [serialize_complaint(c) for c in results]


@router.get("/{complaint_id}", response_model=ComplaintOut, tags=["Complaints"])
def get_complaint_by_id(
    complaint_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve full details of a specific complaint by UUID."""
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.reporter),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
            selectinload(Complaint.evidence),
            selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
        )
        .where(Complaint.id == complaint_id)
    )
    complaint = db.scalars(stmt).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="പരാതി കണ്ടെത്തിയില്ല (Complaint not found)",
        )
    return serialize_complaint(complaint)


@router.get(
    "/{complaint_id}/timeline", response_model=list[ComplaintUpdateOut], tags=["Complaints"]
)
def get_complaint_timeline(
    complaint_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Retrieve chronological audit timeline updates for a complaint."""
    stmt = (
        select(ComplaintUpdate)
        .options(selectinload(ComplaintUpdate.author))
        .where(ComplaintUpdate.complaint_id == complaint_id)
        .order_by(ComplaintUpdate.created_at.asc())
    )
    updates = db.scalars(stmt).all()
    return [
        ComplaintUpdateOut(
            id=u.id,
            previous_status=u.previous_status,
            new_status=u.new_status,
            remarks=u.remarks,
            created_at=u.created_at,
            author_name=u.author.full_name if u.author else "സിസ്റ്റം",
        )
        for u in updates
    ]


@router.post("/{complaint_id}/status", response_model=ComplaintOut, tags=["Complaints"])
def update_complaint_status(
    complaint_id: uuid.UUID,
    payload: StatusUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Transition complaint lifecycle status with state machine enforcement and audit logging.
    """
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.reporter),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
            selectinload(Complaint.evidence),
            selectinload(Complaint.updates).selectinload(ComplaintUpdate.author),
        )
        .where(Complaint.id == complaint_id)
    )
    complaint = db.scalars(stmt).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="പരാതി കണ്ടെത്തിയില്ല (Complaint not found)",
        )

    # 1. Enforce state machine rules & RBAC permissions
    user_role_str = (
        current_user.role.name if hasattr(current_user.role, "name") else str(current_user.role)
    )
    is_owner = str(complaint.reporter_id) == str(current_user.id)

    validate_status_transition(
        current_status=complaint.current_status,
        target_status=payload.new_status,
        user_role=user_role_str,
        is_owner=is_owner,
    )

    prev_status = complaint.current_status
    new_status_upper = payload.new_status.upper()

    # 2. Update complaint model
    complaint.current_status = new_status_upper
    if payload.department_id:
        complaint.department_id = payload.department_id

    # 3. Create immutable audit entry in complaint_updates
    audit_update = ComplaintUpdate(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        changed_by=current_user.id,
        previous_status=prev_status,
        new_status=new_status_upper,
        remarks=payload.remarks.strip(),
    )
    db.add(audit_update)
    db.commit()

    # Dispatch notification to reporting citizen
    notify_status_change(
        db=db,
        reporter_id=complaint.reporter_id,
        complaint_id=complaint.id,
        tracking_code=complaint.tracking_code,
        new_status=new_status_upper,
        remarks=payload.remarks.strip(),
    )

    # Reload complaint
    db.refresh(complaint)
    return serialize_complaint(complaint)


@router.get("/officers/available", response_model=list[OfficerOut], tags=["Authority & Officer"])
def list_available_officers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all Field Officers available for complaint assignment."""
    stmt = (
        select(User)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, UserRole.role_id == Role.id)
        .options(selectinload(User.department))
        .where(Role.name == "OFFICER", User.is_active == True)
    )
    officers = db.scalars(stmt).all()
    return [
        OfficerOut(
            id=o.id,
            full_name=o.full_name,
            email=o.email,
            phone=o.phone,
            role="OFFICER",
            department_name_ml=o.department.name_ml if o.department else "തദ്ദേശ സ്വയംഭരണ വകുപ്പ്",
        )
        for o in officers
    ]


@router.post("/{complaint_id}/assign", response_model=ComplaintOut, tags=["Authority & Officer"])
def assign_complaint_to_officer(
    complaint_id: uuid.UUID,
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Department Authority assigns complaint to a Field Officer with deadline and instructions.
    """
    user_role_str = (
        current_user.role.name if hasattr(current_user.role, "name") else str(current_user.role)
    )
    if user_role_str not in ["AUTHORITY", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="പരാതി ചുമതലപ്പെടുത്താൻ അധികാരിക്ക് മാത്രമേ അനുമതിയുള്ളൂ (Only authorities can assign complaints)",
        )

    # Verify officer exists
    officer = db.scalars(select(User).where(User.id == payload.assigned_to_id)).first()
    if not officer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="തിരഞ്ഞെടുത്ത ഫീൽഡ് ഓഫീസറെ കണ്ടെത്തിയില്ല (Field Officer not found)",
        )

    # Fetch complaint
    stmt = select(Complaint).options(*COMPLAINT_LOAD_OPTIONS).where(Complaint.id == complaint_id)
    complaint = db.scalars(stmt).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="പരാതി കണ്ടെത്തിയില്ല (Complaint not found)",
        )

    # Deactivate any previous active assignments
    for a in complaint.assignments:
        if a.status == "ACTIVE":
            a.status = "REASSIGNED"

    # Create new assignment
    new_assignment = ComplaintAssignment(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        assigned_by=current_user.id,
        assigned_to=officer.id,
        instructions=payload.instructions,
        deadline=payload.deadline,
        status="ACTIVE",
    )
    db.add(new_assignment)

    # Transition status to ASSIGNED if needed
    prev_status = complaint.current_status
    if complaint.current_status != "ASSIGNED":
        validate_status_transition(
            current_status=complaint.current_status,
            target_status="ASSIGNED",
            user_role=user_role_str,
            is_owner=False,
        )
        complaint.current_status = "ASSIGNED"

    # Record Audit Update
    instructions_text = f" നിർദ്ദേശം: {payload.instructions}" if payload.instructions else ""
    audit_update = ComplaintUpdate(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        changed_by=current_user.id,
        previous_status=prev_status,
        new_status="ASSIGNED",
        remarks=f"ഫീൽഡ് ഓഫീസർ {officer.full_name}-നെ ചുമതലപ്പെടുത്തി.{instructions_text}",
    )
    db.add(audit_update)
    db.commit()

    # Dispatch notifications to officer and citizen
    notify_officer_assignment(
        db=db,
        officer_id=officer.id,
        reporter_id=complaint.reporter_id,
        complaint_id=complaint.id,
        tracking_code=complaint.tracking_code,
        instructions=payload.instructions,
    )

    # Reload
    reloaded = db.scalars(
        select(Complaint).options(*COMPLAINT_LOAD_OPTIONS).where(Complaint.id == complaint.id)
    ).first()
    return serialize_complaint(reloaded)


@router.get("/officer/tasks", response_model=list[ComplaintOut], tags=["Authority & Officer"])
def get_officer_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all complaints actively assigned to the authenticated field officer."""
    stmt = (
        select(Complaint)
        .join(ComplaintAssignment, Complaint.id == ComplaintAssignment.complaint_id)
        .options(*COMPLAINT_LOAD_OPTIONS)
        .where(
            ComplaintAssignment.assigned_to == current_user.id,
            ComplaintAssignment.status == "ACTIVE",
        )
        .order_by(desc(Complaint.created_at))
    )
    results = db.scalars(stmt).all()
    return [serialize_complaint(c) for c in results]


@router.post("/{complaint_id}/resolve", response_model=ComplaintOut, tags=["Authority & Officer"])
def resolve_complaint_with_proof(
    complaint_id: uuid.UUID,
    payload: ResolutionProofCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Field Officer or Authority resolves complaint and submits photographic proof.
    """
    user_role_str = (
        current_user.role.name if hasattr(current_user.role, "name") else str(current_user.role)
    )
    if user_role_str not in ["OFFICER", "AUTHORITY", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="പരിഹാര തെളിവ് സമർപ്പിക്കാൻ ഫീൽഡ് ഓഫീസർക്ക് മാത്രമേ അനുമതിയുള്ളൂ (Only Field Officers or Authorities can submit resolution proof)",
        )

    stmt = select(Complaint).options(*COMPLAINT_LOAD_OPTIONS).where(Complaint.id == complaint_id)
    complaint = db.scalars(stmt).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="പരാതി കണ്ടെത്തിയില്ല (Complaint not found)",
        )

    prev_status = complaint.current_status
    validate_status_transition(
        current_status=complaint.current_status,
        target_status="RESOLVED",
        user_role=user_role_str,
        is_owner=False,
    )

    # Save resolution proof photos
    for photo in payload.evidence_photos:
        ev_obj = Evidence(
            id=uuid.uuid4(),
            complaint_id=complaint.id,
            uploaded_by=current_user.id,
            file_url=photo.file_url,
            file_type=photo.file_type,
            file_size_bytes=photo.file_size_bytes,
            evidence_type="FIELD_RESOLUTION_PROOF",
        )
        db.add(ev_obj)

    # Update complaint status
    complaint.current_status = "RESOLVED"

    # Mark active assignment completed
    for a in complaint.assignments:
        if a.status == "ACTIVE":
            a.status = "COMPLETED"

    # Audit log
    audit_update = ComplaintUpdate(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        changed_by=current_user.id,
        previous_status=prev_status,
        new_status="RESOLVED",
        remarks=f"പരിഹാര തെളിവ് രേഖപ്പെടുത്തി: {payload.resolution_notes}",
    )
    db.add(audit_update)
    db.commit()

    # Dispatch notification to reporting citizen
    notify_status_change(
        db=db,
        reporter_id=complaint.reporter_id,
        complaint_id=complaint.id,
        tracking_code=complaint.tracking_code,
        new_status="RESOLVED",
        remarks=f"പരിഹാര തെളിവ് രേഖപ്പെടുത്തി: {payload.resolution_notes}",
    )

    reloaded = db.scalars(
        select(Complaint).options(*COMPLAINT_LOAD_OPTIONS).where(Complaint.id == complaint.id)
    ).first()
    return serialize_complaint(reloaded)
