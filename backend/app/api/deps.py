import uuid
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.auth import User, UserRole, Role
from app.models.department import Department
from app.schemas.auth import UserProfile

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> UserProfile:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="ലോഗിൻ വിവരങ്ങൾ അസാധുവാണ് (Could not validate credentials)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not auth or not auth.credentials:
        raise credentials_exception

    try:
        payload = decode_token(auth.credentials)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        if not user_id_str or token_type != "access":
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    user = db.scalars(stmt).first()
    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ഈ അക്കൗണ്ട് താല്ക്കാലികമായി നിർജ്ജീവമാക്കിയിരിക്കുന്നു (User account is inactive)",
        )

    # Get user role
    role_stmt = select(Role).join(UserRole, Role.id == UserRole.role_id).where(UserRole.user_id == user.id)
    role = db.scalars(role_stmt).first()
    role_name = role.name if role else "COMMUNITY"
    role_ml = role.display_name_ml if role else "പൗരൻ"
    role_en = role.display_name_en if role else "Citizen"

    # Get department if assigned
    dept_name_ml = None
    dept_name_en = None
    if user.department_id:
        dept = db.scalars(select(Department).where(Department.id == user.department_id)).first()
        if dept:
            dept_name_ml = dept.name_ml
            dept_name_en = dept.name_en

    return UserProfile(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=role_name,
        role_display_ml=role_ml,
        role_display_en=role_en,
        department_id=user.department_id,
        department_name_ml=dept_name_ml,
        department_name_en=dept_name_en,
        is_active=user.is_active,
        preferred_language=getattr(user, "preferred_language", "ml") or "ml",
    )


def require_role(allowed_roles: List[str]):
    def role_checker(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
        if current_user.role not in allowed_roles and current_user.role != "SUPER_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"ഈ നടപടിക്ക് അനുമതിയില്ല. ആവശ്യമായ അധികാരം: {', '.join(allowed_roles)} (Insufficient permissions)",
            )
        return current_user
    return role_checker
