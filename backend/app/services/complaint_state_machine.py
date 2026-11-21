from typing import Dict, List, Tuple
from fastapi import HTTPException, status
from app.schemas.complaint import STATUS_ML_MAP

# State Machine Transition Rules
VALID_TRANSITIONS: Dict[str, List[str]] = {
    "SUBMITTED": ["VERIFIED", "ASSIGNED", "REJECTED"],
    "VERIFIED": ["ASSIGNED", "IN_PROGRESS", "REJECTED"],
    "ASSIGNED": ["IN_PROGRESS", "ACTION_TAKEN", "RESOLVED", "REJECTED"],
    "IN_PROGRESS": ["ACTION_TAKEN", "RESOLVED", "REJECTED"],
    "ACTION_TAKEN": ["RESOLVED", "IN_PROGRESS"],
    "RESOLVED": ["REOPENED", "APPEALED"],
    "REJECTED": ["APPEALED", "REOPENED"],
    "APPEALED": ["VERIFIED", "ASSIGNED", "REJECTED", "IN_PROGRESS"],
    "REOPENED": ["VERIFIED", "ASSIGNED", "IN_PROGRESS"],
}

# Role permissions per target state
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "COMMUNITY": ["APPEALED", "REOPENED"],
    "OFFICER": ["IN_PROGRESS", "ACTION_TAKEN", "RESOLVED"],
    "AUTHORITY": ["VERIFIED", "ASSIGNED", "IN_PROGRESS", "ACTION_TAKEN", "RESOLVED", "REJECTED"],
    "SUPER_ADMIN": [
        "SUBMITTED",
        "VERIFIED",
        "ASSIGNED",
        "IN_PROGRESS",
        "ACTION_TAKEN",
        "RESOLVED",
        "REJECTED",
        "APPEALED",
        "REOPENED",
    ],
}


def validate_status_transition(
    current_status: str,
    target_status: str,
    user_role: str,
    is_owner: bool = False,
) -> None:
    """
    Enforces valid state machine transition rules and role authorization.
    Raises HTTPException with clear bilingual Malayalam-English error descriptions.
    """
    current_upper = current_status.upper()
    target_upper = target_status.upper()
    role_upper = user_role.upper()

    # 1. Check if identical
    if current_upper == target_upper:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"പരാതി ഇതിനകം ഈ സ്റ്റാറ്റസിലാണ്: {STATUS_ML_MAP.get(target_upper, target_upper)} (Complaint is already in this status)",
        )

    # 2. Check if transition is topologically valid in state machine
    allowed_targets = VALID_TRANSITIONS.get(current_upper, [])
    if target_upper not in allowed_targets:
        curr_ml = STATUS_ML_MAP.get(current_upper, current_upper)
        target_ml = STATUS_ML_MAP.get(target_upper, target_upper)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"അസാധുവായ സ്റ്റാറ്റസ് മാറ്റം: '{curr_ml}'ൽ നിന്ന് നേരിട്ട് '{target_ml}'ലേക്ക് മാറ്റാൻ സാധ്യമല്ല. "
                f"(Invalid state transition from {current_upper} to {target_upper})"
            ),
        )

    # 3. Check role authorization
    permitted_roles = [
        r for r, targets in ROLE_PERMISSIONS.items() if target_upper in targets
    ]
    if role_upper not in permitted_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"ഈ സ്റ്റാറ്റസ് മാറ്റം ({STATUS_ML_MAP.get(target_upper, target_upper)}) വരുത്താൻ നിങ്ങളുടെ റോളിന് ({role_upper}) അനുമതിയില്ല. "
                f"(User role {role_upper} is not authorized to transition complaints to {target_upper})"
            ),
        )

    # 4. If citizen community role, ensure they only appeal or reopen their OWN complaint
    if role_upper == "COMMUNITY" and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="മറ്റുള്ളവരുടെ പരാതികളിൽ അപ്പീൽ നൽകാൻ അനുമതിയില്ല (Cannot appeal or reopen complaints reported by another citizen)",
        )
