import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.api.deps import require_role
from app.schemas.auth import UserProfile
from app.models.auth import User, Role, UserRole, AuditLog
from app.models.department import Department
from app.models.complaint import Complaint
from app.models.alert import Alert
from app.schemas.admin import (
    SystemStats,
    UserAdminOut,
    UserRoleUpdate,
    UserStatusUpdate,
    DepartmentCreate,
    DepartmentAdminOut,
    AuditLogOut,
)

router = APIRouter(dependencies=[Depends(require_role(["SUPER_ADMIN"]))])

VALID_ROLES = ["COMMUNITY", "AUTHORITY", "OFFICER", "SUPER_ADMIN"]


def record_audit(
    db: Session,
    user_id: uuid.UUID,
    action: str,
    entity_name: str,
    entity_id: Optional[uuid.UUID],
    details: dict,
    ip_address: Optional[str] = None,
):
    log = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity_name=entity_name,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()


@router.get("/stats", response_model=SystemStats)
def get_system_stats(db: Session = Depends(get_db)):
    """Overview telemetry metrics for Super Admin dashboard."""
    total_users = db.query(User).count()
    total_complaints = db.query(Complaint).count()
    active_complaints = (
        db.query(Complaint)
        .filter(Complaint.current_status.notin_(["RESOLVED", "REJECTED"]))
        .count()
    )
    resolved_complaints = (
        db.query(Complaint)
        .filter(Complaint.current_status == "RESOLVED")
        .count()
    )
    total_departments = db.query(Department).count()
    active_alerts = db.query(Alert).filter(Alert.is_active == True).count()
    total_audit_logs = db.query(AuditLog).count()

    return SystemStats(
        total_users=total_users,
        total_complaints=total_complaints,
        active_complaints=active_complaints,
        resolved_complaints=resolved_complaints,
        total_departments=total_departments,
        active_alerts=active_alerts,
        total_audit_logs=total_audit_logs,
    )


@router.get("/users", response_model=List[UserAdminOut])
def list_users(
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    role: Optional[str] = Query(None, description="Filter by role"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve all users with roles and department affiliations."""
    query = (
        db.query(User)
        .options(
            joinedload(User.roles).joinedload(UserRole.role),
            joinedload(User.department),
        )
    )

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (User.full_name.ilike(s)) | (User.email.ilike(s)) | (User.phone.ilike(s))
        )

    users = query.order_by(User.created_at.desc()).limit(limit).all()

    results = []
    for u in users:
        primary_role = u.roles[0].role if u.roles and u.roles[0].role else None
        role_name = primary_role.name if primary_role else "COMMUNITY"
        role_ml = primary_role.display_name_ml if primary_role else "പൗരൻ"

        if role and role != "ALL" and role_name != role:
            continue

        results.append(
            UserAdminOut(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                phone=u.phone,
                role=role_name,
                role_display_ml=role_ml,
                department_id=u.department_id,
                department_name_ml=u.department.name_ml if u.department else None,
                is_active=u.is_active,
                is_verified=u.is_verified,
                created_at=u.created_at,
            )
        )
    return results


@router.patch("/users/{user_id}/role", response_model=UserAdminOut)
def update_user_role(
    user_id: uuid.UUID,
    payload: UserRoleUpdate,
    request: Request,
    current_user: UserProfile = Depends(require_role(["SUPER_ADMIN"])),
    db: Session = Depends(get_db),
):
    """Change a user's role and departmental assignment."""
    if payload.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"അസാധുവായ റോൾ. സാധുവായവ: {', '.join(VALID_ROLES)}",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ഉപയോക്താവിനെ കണ്ടെത്തിയില്ല (User not found)",
        )

    # Find target role
    new_role = db.query(Role).filter_by(name=payload.role).first()
    if not new_role:
        new_role = Role(name=payload.role, display_name_ml=payload.role, display_name_en=payload.role)
        db.add(new_role)
        db.commit()

    # Update or insert user_roles
    db.query(UserRole).filter(UserRole.user_id == target_user.id).delete()
    db.add(UserRole(user_id=target_user.id, role_id=new_role.id))

    # Update department if provided
    if payload.department_id is not None:
        target_user.department_id = payload.department_id

    db.commit()
    db.refresh(target_user)

    # Record Audit Log
    client_ip = request.client.host if request.client else None
    record_audit(
        db=db,
        user_id=current_user.id,
        action="ADMIN_ROLE_CHANGE",
        entity_name="User",
        entity_id=target_user.id,
        details={
            "target_email": target_user.email,
            "new_role": payload.role,
            "department_id": str(payload.department_id) if payload.department_id else None,
            "updated_by": current_user.email,
        },
        ip_address=client_ip,
    )

    dept = db.query(Department).filter(Department.id == target_user.department_id).first() if target_user.department_id else None

    return UserAdminOut(
        id=target_user.id,
        full_name=target_user.full_name,
        email=target_user.email,
        phone=target_user.phone,
        role=new_role.name,
        role_display_ml=new_role.display_name_ml,
        department_id=target_user.department_id,
        department_name_ml=dept.name_ml if dept else None,
        is_active=target_user.is_active,
        is_verified=target_user.is_verified,
        created_at=target_user.created_at,
    )


@router.patch("/users/{user_id}/status", response_model=UserAdminOut)
def update_user_status(
    user_id: uuid.UUID,
    payload: UserStatusUpdate,
    request: Request,
    current_user: UserProfile = Depends(require_role(["SUPER_ADMIN"])),
    db: Session = Depends(get_db),
):
    """Activate or deactivate a user account."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ഉപയോക്താവിനെ കണ്ടെത്തിയില്ല (User not found)",
        )

    target_user.is_active = payload.is_active
    db.commit()
    db.refresh(target_user)

    client_ip = request.client.host if request.client else None
    record_audit(
        db=db,
        user_id=current_user.id,
        action="ADMIN_USER_STATUS_TOGGLE",
        entity_name="User",
        entity_id=target_user.id,
        details={"target_email": target_user.email, "is_active": payload.is_active},
        ip_address=client_ip,
    )

    primary_role = target_user.roles[0].role if target_user.roles and target_user.roles[0].role else None
    role_name = primary_role.name if primary_role else "COMMUNITY"
    role_ml = primary_role.display_name_ml if primary_role else "പൗരൻ"

    return UserAdminOut(
        id=target_user.id,
        full_name=target_user.full_name,
        email=target_user.email,
        phone=target_user.phone,
        role=role_name,
        role_display_ml=role_ml,
        department_id=target_user.department_id,
        department_name_ml=target_user.department.name_ml if target_user.department else None,
        is_active=target_user.is_active,
        is_verified=target_user.is_verified,
        created_at=target_user.created_at,
    )


@router.get("/departments", response_model=List[DepartmentAdminOut])
def list_departments_admin(db: Session = Depends(get_db)):
    """List all departments with associated metrics."""
    departments = db.query(Department).order_by(Department.code).all()
    results = []
    for d in departments:
        user_count = db.query(User).filter(User.department_id == d.id).count()
        complaint_count = db.query(Complaint).filter(Complaint.department_id == d.id).count()
        results.append(
            DepartmentAdminOut(
                id=d.id,
                code=d.code,
                name_ml=d.name_ml,
                name_en=d.name_en,
                contact_email=d.contact_email,
                contact_phone=d.contact_phone,
                is_active=d.is_active,
                user_count=user_count,
                complaint_count=complaint_count,
                created_at=d.created_at,
            )
        )
    return results


@router.post("/departments", response_model=DepartmentAdminOut, status_code=status.HTTP_201_CREATED)
def create_department_admin(
    payload: DepartmentCreate,
    request: Request,
    current_user: UserProfile = Depends(require_role(["SUPER_ADMIN"])),
    db: Session = Depends(get_db),
):
    """Create a new government or environmental department."""
    existing = db.query(Department).filter(Department.code == payload.code.strip().upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ഈ കോഡിലുള്ള വകുപ്പ് ഇതിനകം നിലവിലുണ്ട് (Department code already exists)",
        )

    dept = Department(
        id=uuid.uuid4(),
        code=payload.code.strip().upper(),
        name_ml=payload.name_ml.strip(),
        name_en=payload.name_en.strip(),
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        is_active=True,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)

    client_ip = request.client.host if request.client else None
    record_audit(
        db=db,
        user_id=current_user.id,
        action="ADMIN_CREATE_DEPARTMENT",
        entity_name="Department",
        entity_id=dept.id,
        details={"code": dept.code, "name_en": dept.name_en},
        ip_address=client_ip,
    )

    return DepartmentAdminOut(
        id=dept.id,
        code=dept.code,
        name_ml=dept.name_ml,
        name_en=dept.name_en,
        contact_email=dept.contact_email,
        contact_phone=dept.contact_phone,
        is_active=dept.is_active,
        user_count=0,
        complaint_count=0,
        created_at=dept.created_at,
    )


@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action name"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve security audit logs."""
    query = db.query(AuditLog).options(joinedload(AuditLog.user))

    if action and action != "ALL":
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()

    return [
        AuditLogOut(
            id=l.id,
            user_id=l.user_id,
            user_email=l.user.email if l.user else None,
            user_name=l.user.full_name if l.user else None,
            action=l.action,
            entity_name=l.entity_name,
            entity_id=l.entity_id,
            ip_address=l.ip_address,
            details=l.details,
            created_at=l.created_at,
        )
        for l in logs
    ]
