# 08. NAAM (നാം) — Complete Database Schema (DDL)

```sql
-- ========================================================
-- NAAM (നാം) DDL Specification - PostgreSQL 16 + PostGIS
-- ========================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. ROLES & PERMISSIONS
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'COMMUNITY', 'AUTHORITY', 'OFFICER', 'SUPER_ADMIN'
    display_name_ml VARCHAR(100) NOT NULL,
    display_name_en VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'complaint:create', 'complaint:assign'
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. DEPARTMENTS & LSGDs
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'LSGD', 'SUCHITWA', 'KSPCB', 'IRRIGATION'
    name_ml VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. LOCATIONS (SPATIAL GEOMETRIES)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    district VARCHAR(100) NOT NULL, -- 'Thiruvananthapuram', 'Ernakulam', etc.
    lsgd_type VARCHAR(50) NOT NULL, -- 'GRAMA_PANCHAYAT', 'MUNICIPALITY', 'CORPORATION'
    lsgd_name VARCHAR(150) NOT NULL,
    ward_number VARCHAR(10),
    landmark TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_locations_geom ON locations USING GIST (geom);
CREATE INDEX idx_locations_district ON locations (district);

-- 5. COMPLAINTS (CORE STATE MACHINE ENTITY)
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'NAAM-2026-00412'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'SOLID_WASTE', 'WATER_POLLUTION', 'DRAINAGE', 'FLOOD', 'OTHER'
    severity VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    current_status VARCHAR(30) DEFAULT 'SUBMITTED' NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_complaints_status ON complaints (current_status);
CREATE INDEX idx_complaints_category ON complaints (category);
CREATE INDEX idx_complaints_reporter ON complaints (reporter_id);
CREATE INDEX idx_complaints_created ON complaints (created_at DESC);

-- 6. COMPLAINT ASSIGNMENTS
CREATE TABLE complaint_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    instructions TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'COMPLETED', 'REASSIGNED'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. COMPLAINT STATUS TRANSITION AUDIT
CREATE TABLE complaint_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    previous_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. EVIDENCE & ATTACHMENTS
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    evidence_type VARCHAR(30) DEFAULT 'CITIZEN_SUBMISSION' NOT NULL, -- 'CITIZEN_SUBMISSION', 'FIELD_INSPECTION', 'RESOLUTION_PROOF'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. ALERTS & NOTIFICATIONS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ml VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    message_ml TEXT NOT NULL,
    message_en TEXT NOT NULL,
    alert_level VARCHAR(20) DEFAULT 'WARNING' NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
    alert_source VARCHAR(30) DEFAULT 'OFFICIAL_WARNING' NOT NULL, -- 'OFFICIAL_WARNING', 'COMMUNITY_REPORT', 'SIMULATED_DEMO_ALERT'
    affected_district VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    reference_type VARCHAR(50), -- 'COMPLAINT', 'ALERT'
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'LOGIN_SUCCESS', 'ROLE_CHANGE', 'COMPLAINT_DELETE_ATTEMPT'
    entity_name VARCHAR(50),
    entity_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```
