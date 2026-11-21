# 04. NAAM (നാം) — System Architecture

## 1. High-Level Architecture Overview
NAAM is engineered as a **Modular Monolith** designed for high developer velocity, clear separation of concerns, rapid MVP demonstration, and frictionless transition to cloud micro-services when scaled across Kerala's 1034 Local Self-Government bodies.

```mermaid
graph TB
    subgraph ClientLayer["Presentation Layer (Client Devices)"]
        CP["Community Portal (പൗരൻ)<br/>Mobile & Web Responsive"]
        AP["Authority Portal (അധികാരികൾ)<br/>Desktop & Tablet Dashboard"]
        OP["Field Officer Portal (ഫീൽഡ് ഓഫീസർ)<br/>Mobile-First Task View"]
        SP["Super Admin Dashboard (സിസ്റ്റം അഡ്മിൻ)<br/>Master Management Console"]
    end

    subgraph GatewayLayer["Network & Security Boundary"]
        CORS["CORS & Rate Limiting Middleware"]
        AuthMiddleware["JWT Authentication & RBAC Guard"]
    end

    subgraph ApplicationLayer["FastAPI Modular Application"]
        subgraph CoreModules["Core Modules"]
            AuthMod["Auth & User Service"]
            DeptMod["Department & LSGD Service"]
            CompMod["Complaint & State Machine Service"]
            AssignMod["Assignment & Field Officer Service"]
            GeoMod["Geospatial & Clustering Service"]
            AlertMod["Alert & Notification Engine"]
            AuditMod["Audit Logging Service"]
        end
    end

    subgraph PersistenceLayer["Data & Storage Layer"]
        PG["PostgreSQL 16 + PostGIS 3.4<br/>(Relational & Spatial Geometries)"]
        OBJ["Object Storage (S3 / Local Media / Supabase)<br/>(Evidence & Field Photos)"]
    end

    CP & AP & OP & SP --> CORS
    CORS --> AuthMiddleware
    AuthMiddleware --> CoreModules
    CoreModules --> PG
    CoreModules --> OBJ
```

---

## 2. Layered Responsibilities

### 2.1 Presentation Layer (Frontend)
- **Framework:** React 18+ with TypeScript, bundled using Vite.
- **Styling & UI:** Tailwind CSS combined with accessible shadcn/ui primitive components.
- **State Architecture:**
  - **Server State:** TanStack Query (React Query) for caching, optimistic updates, and background re-fetching of complaint feeds.
  - **Client/UI State:** Zustand for localized state (active map bounds, modal triggers, language toggle).
- **Internationalization:** `react-i18next` with JSON-based Malayalam (`ml`) and English (`en`) translation keys.

### 2.2 API & Business Logic Layer (Backend)
- **Framework:** Python 3.12 with FastAPI for asynchronous, high-throughput REST operations.
- **Validation:** Pydantic v2 schemas providing strict compile-time and runtime data validation.
- **Database Abstraction:** SQLAlchemy 2.0 (asyncio-ready ORM) with GeoAlchemy2 for spatial data structures.
- **Security:** Argon2id password hashing via `pwdlib`, PyJWT for cryptographically signed access tokens, and rate-limiting via SlowAPI.

### 2.3 Data Persistence Layer
- **PostgreSQL 16:** Relational storage for users, roles, departments, complaints, and audit logs.
- **PostGIS Extension:** Spatial indexing (`GIST`) on `geometry(Point, 4326)` columns allowing sub-millisecond bounding box searches and radius queries (`ST_DWithin`).
- **File Storage:** Storage abstraction interface allowing local filesystem storage for development and S3/Supabase Storage for cloud deployment.

---

## 3. Communication & Data Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as പൗരൻ (Citizen)
    participant Client as Frontend (React + Vite)
    participant API as Backend (FastAPI /api/v1)
    participant DB as PostgreSQL + PostGIS
    participant Store as Object Storage
    actor Officer as അധികാരി (Authority)

    Citizen->>Client: Fills complaint form & attaches photo
    Client->>Client: Captures GPS or map pin (lat/lng)
    Client->>API: POST /api/v1/complaints (multipart/form-data)
    API->>API: Validate schema & sanitize coordinates
    API->>Store: Persist photo evidence
    API->>DB: INSERT INTO complaints & locations
    DB-->>API: Complaint Created (UUID, Status: SUBMITTED)
    API-->>Client: 201 Created with tracking ID
    Client-->>Citizen: Displays success & tracking badge

    Officer->>Client: Logs into Authority Portal
    Client->>API: GET /api/v1/complaints?dept=LSGD&status=SUBMITTED
    API->>DB: Query spatial filter & status
    DB-->>API: Complaint records
    API-->>Client: Returns JSON list
    Officer->>Client: Reviews evidence & assigns Field Officer
    Client->>API: POST /api/v1/complaints/{id}/assign
    API->>DB: UPDATE status=ASSIGNED, INSERT INTO complaint_assignments
    API->>DB: INSERT INTO notifications
    API-->>Client: 200 OK (Status Updated)
```
