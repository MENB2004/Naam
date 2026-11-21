# 01. NAAM (നാം) — Requirements and Scope Specification

## 1. Functional Requirements (FR)

### FR-01: Multi-Role Authentication & Profile Management
- The system shall provide distinct authentication entry points: `/login/community`, `/login/authority`, `/login/officer`, and `/login/admin`.
- Authentication shall be backed by a centralized backend verifying credentials with Argon2id password hashing.
- Citizens shall be able to register with name, phone number, email, and primary LSGD/Ward.
- Session tokens (JWT access tokens) shall have a short lifespan (15–30 minutes) backed by secure refresh token rotation stored in HttpOnly cookies or protected storage.

### FR-02: Malayalam-First Bilingual Interface
- Malayalam shall be the default language across all views, forms, dialogs, and notifications.
- The user shall be able to toggle seamlessly to English at any time without losing form state.
- Language preference shall be persisted in local storage and linked to user profiles.
- All Malayalam text must use standard Kerala Unicode typography rendered using the *Noto Sans Malayalam* typeface.

### FR-03: Environmental Complaint Submission
- Citizens shall be able to submit reports across five primary categories:
  1. **ഖരമാലിന്യ നിക്ഷേപം (Solid Waste Dumping)**
  2. **ജല മലിനീകരണം (Water Body Pollution)**
  3. **ഓവുചാൽ / ഡ്രെയിനേജ് തടസ്സം (Drainage & Sewage Blockage)**
  4. **വെള്ളപ്പൊക്ക / വെള്ളക്കെട്ട് ഭീഷണി (Flooding & Waterlogging Hazard)**
  5. **മറ്റ് പരിസ്ഥിതി പ്രശ്നങ്ങൾ (Other Environmental Hazards)**
- Each report must capture:
  - Title and detailed description in Malayalam or English.
  - Severity level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - Geolocation (latitude, longitude, accuracy radius, landmark description, ward/LSGD name).
  - Up to 5 evidentiary photographs.

### FR-04: Geospatial Location Capture & Map Interaction
- The system shall capture current device GPS coordinates with explicit user consent.
- If GPS is inaccurate or unavailable, the user shall be able to drag-and-drop a map pin on an interactive Leaflet map to indicate the exact problem spot.
- Locations must be validated within the bounds of Kerala (Latitude: 8.15°N to 12.85°N, Longitude: 74.85°E to 77.40°E).
- Spatial queries must leverage PostGIS geometries (`SRID 4326`).

### FR-05: Complaint Lifecycle & State Machine
- The platform shall enforce valid state transitions:
  `SUBMITTED` → `UNDER_REVIEW` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `VERIFIED`.
- Alternate states: `REJECTED` (with mandatory rejection reason) and `REOPENED` (by citizen within 7 days of resolution).
- Every state transition must record timestamp, performing user ID, previous state, new state, and official remarks.

### FR-06: Authority Triage & Field Assignment
- Departmental officers shall view an inbox filtered by their department and jurisdictional jurisdiction (LSGD/Ward).
- Officers can reject spam/out-of-scope complaints, request more info, or assign the complaint to a designated Field Officer with instructions and priority deadlines.

### FR-07: Field Officer Inspection & Evidence of Resolution
- Field officers shall access assigned tasks, view GPS locations on a mobile-friendly map, and inspect citizen evidence.
- Field officers shall submit work-in-progress notes and final resolution proof (mandatory before-and-after photo evidence).

### FR-08: Interactive Public Environmental Issue Map
- A public map view shall display non-sensitive, aggregated complaint clusters with color-coded severity markers.
- Users can filter markers by category, resolution status, date range, and administrative district.

### FR-09: Notifications & Environmental Alert Feed
- Citizens and officers shall receive in-app notifications upon any status change or comment on their reports.
- Super Admins and Authorities can broadcast public environmental alerts (e.g., heavy rain alerts, waste collection drives, river pollution warnings).
- The platform shall clearly badge alerts as: `OFFICIAL_WARNING`, `COMMUNITY_REPORT`, or `SIMULATED_DEMO_ALERT`.

### FR-10: Super Admin Oversight & Configuration
- Super admins shall manage master data: Departments, Roles, Permissions, Categories, and LSGD Wards.
- Access system audit logs and view aggregate platform health metrics.

---

## 2. Non-Functional Requirements (NFR)

| Metric | Requirement |
|---|---|
| **Performance** | API response time < 250ms for standard queries; map tile load < 800ms. |
| **Responsiveness** | Mobile-first responsive UI (tested across 360px mobile to 1920px desktop). |
| **Accessibility** | WCAG 2.1 AA compliance: minimum 4.5:1 color contrast, screen reader aria-labels. |
| **Security** | OWASP Top 10 compliance: zero plain-text passwords, SQL injection-safe ORM, strict CORS. |
| **Data Integrity** | Foreign key constraints, PostGIS geometry validation, UTC timestamp enforcement. |
| **File Handling** | Client-side and server-side image compression; MIME type validation (JPEG, PNG, WebP); max 5MB per image. |

---

## 3. Data Classification Policy
To preserve credibility and transparency, all platform data must be clearly tagged:
1. **Real Field Observations:** Citizen-submitted photos and field observations from authentic Kerala locations.
2. **Official Information:** Certified notices from Kerala Disaster Management, KSPCB, or LSGDs.
3. **Sample / Simulated Data:** Clearly labeled records (`[DEMO]` prefix or visual badge) used for feature demonstration and testing.
