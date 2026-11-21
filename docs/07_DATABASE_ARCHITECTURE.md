# 07. NAAM (നാം) — Database Architecture & Data Strategy

## 1. Architectural Philosophy
The NAAM database is structured to support high-volume relational transactions, spatial geo-queries, full auditability, and verifiable complaint lifecycle state transitions.

### Key Tenets:
1. **UUID Primary Keys:** All core entities use UUIDv4 / UUIDv7 to eliminate enumerable ID attacks and simplify distributed replication.
2. **PostGIS Geometries:** Spatial locations are stored natively as `geometry(Point, 4326)` allowing indexed distance calculations (`ST_DWithin`) and bounding-box queries.
3. **No Hard Deletes for Operational Records:** Complaints, status logs, and evidence records are immutable. Soft deletes via `is_deleted` and `deleted_at` are enforced where necessary.
4. **Append-Only Audit Trails:** Every status transition and field assignment writes an immutable log to `complaint_updates` and `audit_logs`.
5. **UTC Everywhere:** All timestamps are stored as `TIMESTAMPTZ` (UTC). Timezone conversions to Indian Standard Time (IST, UTC+05:30) occur in the presentation layer.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : contains
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : defines
    DEPARTMENTS ||--o{ USERS : employs
    DEPARTMENTS ||--o{ COMPLAINTS : manages
    LOCATIONS ||--|| COMPLAINTS : locates
    USERS ||--o{ COMPLAINTS : reports
    COMPLAINTS ||--o{ COMPLAINT_ASSIGNMENTS : assigned
    USERS ||--o{ COMPLAINT_ASSIGNMENTS : receives_task
    COMPLAINTS ||--o{ COMPLAINT_UPDATES : transitions
    COMPLAINTS ||--o{ EVIDENCE : contains
    USERS ||--o{ NOTIFICATIONS : receives
    ALERTS ||--o{ NOTIFICATIONS : generates
    USERS ||--o{ AUDIT_LOGS : performs

    USERS {
        uuid id PK
        string full_name
        string email UK
        string phone UK
        string password_hash
        uuid department_id FK
        boolean is_active
        timestamptz created_at
    }

    COMPLAINTS {
        uuid id PK
        string tracking_code UK
        string title
        text description
        string category
        string severity
        string current_status
        uuid reporter_id FK
        uuid department_id FK
        uuid location_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    LOCATIONS {
        uuid id PK
        geometry point_geom
        float latitude
        float longitude
        string district
        string lsgd_type
        string lsgd_name
        string ward_number
        string landmark
    }

    EVIDENCE {
        uuid id PK
        uuid complaint_id FK
        uuid uploaded_by FK
        string file_url
        string file_type
        string evidence_type
        timestamptz created_at
    }

    COMPLAINT_UPDATES {
        uuid id PK
        uuid complaint_id FK
        uuid changed_by FK
        string previous_status
        string new_status
        text remarks
        timestamptz created_at
    }
```
