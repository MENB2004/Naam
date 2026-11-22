import uuid
from datetime import UTC, datetime

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.auth import Role, User, UserRole
from app.models.department import Department
from app.schemas.auth import (
    LanguagePreferenceUpdate,
    RefreshTokenRequest,
    TokenResponse,
    UserLogin,
    UserProfile,
    UserProfileUpdate,
    UserRegister,
)

router = APIRouter()


@router.post(
    "/community/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new citizen user in the Community portal."""
    # Check existing email
    stmt = select(User).where(User.email == user_in.email)
    if db.scalars(stmt).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ഈ ഇമെയിൽ വിലാസം ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (Email already registered)",
        )

    # Check existing phone
    if user_in.phone:
        stmt_phone = select(User).where(User.phone == user_in.phone)
        if db.scalars(stmt_phone).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ഈ ഫോൺ നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (Phone number already registered)",
            )

    # Create user
    user = User(
        id=uuid.uuid4(),
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        is_active=True,
        is_verified=False,
        preferred_language=user_in.preferred_language or "ml",
        locality=user_in.locality.strip() if user_in.locality else None,
        privacy_consent_at=datetime.now(UTC),
    )
    db.add(user)
    db.flush()

    # Assign default COMMUNITY role
    role = db.scalars(select(Role).where(Role.name == "COMMUNITY")).first()
    if role:
        user_role = UserRole(user_id=user.id, role_id=role.id)
        db.add(user_role)

    db.commit()

    # Build response profile
    profile = UserProfile(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=role.name if role else "COMMUNITY",
        role_display_ml=role.display_name_ml if role else "പൗരൻ",
        role_display_en=role.display_name_en if role else "Citizen",
        is_active=user.is_active,
        preferred_language=user.preferred_language,
        locality=user.locality,
    )

    token_data = {"sub": str(user.id), "role": profile.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=profile,
    )


@router.post("/login", response_model=TokenResponse, tags=["Authentication"])
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and return JWT tokens."""
    stmt = select(User).where(
        or_(User.email == login_in.identifier, User.phone == login_in.identifier)
    )
    user = db.scalars(stmt).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="തെറ്റായ ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് (Invalid email or password)",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ഈ അക്കൗണ്ട് താല്ക്കാലികമായി നിർജ്ജീവമാക്കിയിരിക്കുന്നു (Account is inactive)",
        )

    # Resolve user role
    role_stmt = (
        select(Role).join(UserRole, Role.id == UserRole.role_id).where(UserRole.user_id == user.id)
    )
    role = db.scalars(role_stmt).first()
    role_name = role.name if role else "COMMUNITY"

    # Optional role check for portal-specific entry (e.g. Authority logging in at /login/authority)
    if login_in.expected_role and role_name != "SUPER_ADMIN" and login_in.expected_role != role_name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"ഈ പോർട്ടലിലേക്ക് പ്രവേശിക്കാൻ അനുമതിയില്ല. താങ്കളുടെ റോൾ: {role.display_name_ml if role else role_name}",
        )

    # Department info
    dept_name_ml = None
    dept_name_en = None
    if user.department_id:
        dept = db.scalars(select(Department).where(Department.id == user.department_id)).first()
        if dept:
            dept_name_ml = dept.name_ml
            dept_name_en = dept.name_en

    profile = UserProfile(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=role_name,
        role_display_ml=role.display_name_ml if role else "പൗരൻ",
        role_display_en=role.display_name_en if role else "Citizen",
        department_id=user.department_id,
        department_name_ml=dept_name_ml,
        department_name_en=dept_name_en,
        is_active=user.is_active,
        preferred_language=getattr(user, "preferred_language", "ml") or "ml",
        locality=user.locality,
    )

    token_data = {"sub": str(user.id), "role": role_name}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=profile,
    )


@router.patch("/me/language", response_model=UserProfile, tags=["Authentication"])
def update_language_preference(
    lang_in: LanguagePreferenceUpdate,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Persist user's preferred application language (Malayalam or English)."""
    user = db.scalars(select(User).where(User.id == current_user.id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ഉപയോക്താവിനെ കണ്ടെത്തിയില്ല (User not found)",
        )
    user.preferred_language = lang_in.preferred_language
    db.commit()
    db.refresh(user)

    current_user.preferred_language = user.preferred_language
    return current_user


@router.post("/refresh", tags=["Authentication"])
def refresh(refresh_in: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Generate a new access token using a valid refresh token."""
    try:
        payload = decode_token(refresh_in.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )
        user_id_str = payload.get("sub")
        user_id = uuid.UUID(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="റീഫ്രഷ് ടോക്കൺ അസാധുവാണ് (Invalid or expired refresh token)",
        )

    user = db.scalars(select(User).where(User.id == user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive"
        )

    role_stmt = (
        select(Role).join(UserRole, Role.id == UserRole.role_id).where(UserRole.user_id == user.id)
    )
    role = db.scalars(role_stmt).first()
    role_name = role.name if role else "COMMUNITY"

    token_data = {"sub": str(user.id), "role": role_name}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserProfile, tags=["Authentication"])
def get_me(current_user: UserProfile = Depends(get_current_user)):
    """Retrieve profile and permissions of the currently authenticated user."""
    return current_user


@router.patch("/me/profile", response_model=UserProfile, tags=["Authentication"])
def update_my_profile(
    profile_in: UserProfileUpdate,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update basic profile fields for the authenticated community member."""
    if current_user.role != "COMMUNITY":
        raise HTTPException(status_code=403, detail="Only community accounts can edit this profile")
    user = db.scalars(select(User).where(User.id == current_user.id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    phone = profile_in.phone.strip() if profile_in.phone else None
    if phone:
        existing = db.scalars(select(User).where(User.phone == phone, User.id != user.id)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    user.full_name = profile_in.full_name.strip()
    user.phone = phone
    user.locality = profile_in.locality.strip() if profile_in.locality else None
    db.commit()
    db.refresh(user)
    current_user.full_name = user.full_name
    current_user.phone = user.phone
    current_user.locality = user.locality
    return current_user
