import secrets
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.auth import User
from app.models.complaint import Complaint, ComplaintUpdate, Evidence
from app.models.location import Location
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintOut,
    CATEGORY_ML_MAP,
    STATUS_ML_MAP,
)

router = APIRouter()


def generate_unique_tracking_code(db: Session) -> str:
    """Generate a citizen-friendly unique tracking code: NAAM-2026-XXXXX."""
    for _ in range(10):
        code_number = secrets.randbelow(90000) + 10000
        tracking_code = f"NAAM-2026-{code_number}"
        exists = db.scalars(select(Complaint.id).where(Complaint.tracking_code == tracking_code)).first()
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
    )


@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED, tags=["Complaints"])
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


@router.get("/me", response_model=List[ComplaintOut], tags=["Complaints"])
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


@router.get("", response_model=List[ComplaintOut], tags=["Complaints"])
def list_public_complaints(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    district: Optional[str] = None,
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
