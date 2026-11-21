import html
import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


def sanitize_input_text(val: str) -> str:
    """Sanitize freeform text against XSS and script injection attacks."""
    if not val:
        return val
    # Strip executable script, iframe, and embedded objects
    cleaned = re.sub(
        r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", val, flags=re.DOTALL | re.IGNORECASE
    )
    cleaned = re.sub(
        r"<\s*(iframe|object|embed|applet)[^>]*>.*?<\s*/\s*\1\s*>",
        "",
        cleaned,
        flags=re.DOTALL | re.IGNORECASE,
    )
    return html.escape(cleaned.strip())


# Kerala Geographic Coordinate Bounds
KERALA_MIN_LAT = 8.0
KERALA_MAX_LAT = 13.0
KERALA_MIN_LON = 74.5
KERALA_MAX_LON = 77.8

CATEGORY_ML_MAP = {
    "WASTE": "മാലിന്യ നിക്ഷേപം",
    "WATER_POLLUTION": "ജല മലിനീകരണം",
    "DRAINAGE": "ഡ്രെയിനേജ് തടസ്സം",
    "FLOODING": "വെള്ളപ്പൊക്കം / വെള്ളക്കെട്ട്",
    "AIR_POLLUTION": "വായു മലിനീകരണം",
    "DEFORESTATION": "വനനശീകരണം / കണ്ടൽ നശീകരണം",
    "ILLEGAL_MINING": "അനധികൃത ഖനനം",
    "OTHER": "മറ്റ് പരിസ്ഥിതി പ്രശ്നങ്ങൾ",
}

STATUS_ML_MAP = {
    "SUBMITTED": "സമർപ്പിച്ചു",
    "VERIFIED": "പരിശോധിച്ചു",
    "ASSIGNED": "ചുമതലപ്പെടുത്തി",
    "IN_PROGRESS": "നടപടിയിൽ",
    "ACTION_TAKEN": "നടപടി സ്വീകരിച്ചു",
    "RESOLVED": "പരിഹരിച്ചു",
    "REJECTED": "നിരസിച്ചു",
    "APPEALED": "അപ്പീൽ നൽകി",
}


class LocationCreate(BaseModel):
    latitude: float = Field(..., description="Latitude in decimal degrees")
    longitude: float = Field(..., description="Longitude in decimal degrees")
    district: str = Field(..., max_length=100)
    lsgd_type: str = Field(default="GRAMA_PANCHAYAT", max_length=50)
    lsgd_name: str = Field(..., max_length=150)
    ward_number: str | None = Field(None, max_length=10)
    landmark: str | None = None

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (KERALA_MIN_LAT <= v <= KERALA_MAX_LAT):
            raise ValueError("ദയവായി കേരളത്തിനകത്തുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക (Latitude out of Kerala bounds)")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (KERALA_MIN_LON <= v <= KERALA_MAX_LON):
            raise ValueError("ദയവായി കേരളത്തിനകത്തുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക (Longitude out of Kerala bounds)")
        return v


class LocationOut(BaseModel):
    id: uuid.UUID
    latitude: float
    longitude: float
    district: str
    lsgd_type: str
    lsgd_name: str
    ward_number: str | None = None
    landmark: str | None = None

    model_config = ConfigDict(from_attributes=True)


class EvidenceCreate(BaseModel):
    file_url: str
    file_type: str = "image/jpeg"
    file_size_bytes: int = 1024
    evidence_type: str = "CITIZEN_SUBMISSION"


class EvidenceOut(BaseModel):
    id: uuid.UUID
    file_url: str
    file_type: str
    file_size_bytes: int
    evidence_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintUpdateOut(BaseModel):
    id: uuid.UUID
    previous_status: str
    new_status: str
    remarks: str | None = None
    created_at: datetime
    author_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    category: str = Field(default="WASTE")
    severity: str = Field(default="MEDIUM")
    location: LocationCreate
    evidence: list[EvidenceCreate] | None = []

    @field_validator("title")
    @classmethod
    def validate_and_sanitize_title(cls, v: str) -> str:
        sanitized = sanitize_input_text(v)
        if len(sanitized) < 5:
            raise ValueError(
                "ശീർഷകത്തിൽ കുറഞ്ഞത് 5 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം (Title must have at least 5 characters)"
            )
        return sanitized

    @field_validator("description")
    @classmethod
    def validate_and_sanitize_description(cls, v: str) -> str:
        sanitized = sanitize_input_text(v)
        if len(sanitized) < 10:
            raise ValueError(
                "വിവരണത്തിൽ കുറഞ്ഞത് 10 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം (Description must have at least 10 characters)"
            )
        return sanitized


class StatusUpdatePayload(BaseModel):
    new_status: str = Field(..., description="Target lifecycle state")
    remarks: str = Field(..., min_length=2, max_length=1000, description="Audit log explanation")
    assigned_to_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None


class AssignmentCreate(BaseModel):
    assigned_to_id: uuid.UUID
    deadline: datetime | None = None
    instructions: str | None = None


class AssignmentOut(BaseModel):
    id: uuid.UUID
    complaint_id: uuid.UUID
    assigned_by_id: uuid.UUID
    assigned_by_name: str | None = None
    assigned_to_id: uuid.UUID
    assigned_to_name: str | None = None
    instructions: str | None = None
    deadline: datetime | None = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResolutionProofCreate(BaseModel):
    resolution_notes: str = Field(..., min_length=5, description="Field inspection outcome notes")
    evidence_photos: list[EvidenceCreate] = Field(
        ..., min_length=1, description="After-resolution photos"
    )


class OfficerOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str | None = None
    role: str = "OFFICER"
    department_name_ml: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintOut(BaseModel):
    id: uuid.UUID
    tracking_code: str
    title: str
    description: str
    category: str
    category_display_ml: str
    severity: str
    current_status: str
    status_display_ml: str
    reporter_id: uuid.UUID
    reporter_name: str | None = None
    department_id: uuid.UUID | None = None
    department_name_ml: str | None = None
    created_at: datetime
    updated_at: datetime
    location: LocationOut
    evidence: list[EvidenceOut] = []
    updates: list[ComplaintUpdateOut] = []
    assignments: list[AssignmentOut] = []

    model_config = ConfigDict(from_attributes=True)
