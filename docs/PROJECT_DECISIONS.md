# NAAM (നാം) — Project Decisions and Approvals Log

## 1. Architectural Decisions Recorded
- **ADR-001:** Approved Modular Monolith architecture using React + Vite + TypeScript (Frontend) and FastAPI + SQLAlchemy 2.0 (Backend).
- **ADR-002:** Approved PostgreSQL 16 + PostGIS 3.4 for relational and geospatial storage.
- **ADR-003:** Approved Malayalam-first user interface with native JSON localization keys and standard Noto Sans Malayalam typography.
- **ADR-004:** Approved 4-tier Role-Based Access Control (Community, Authority, Field Officer, Super Admin).
- **ADR-005:** Approved phase execution model with temporary execution markdown files deleted strictly upon verified phase completion.
- **ADR-006:** Approved pure-Python PBKDF2-HMAC-SHA256 password hashing and pure-Python database drivers (`pg8000`, `sqlite3`) to guarantee 100% compatibility with Windows Defender Application Control (WDAC).
- **ADR-007:** Approved Kerala geographic bounding box enforcement (Lat 8.0-13.0, Lon 74.5-77.8) with Leaflet interactive pin-drop map and citizen tracking codes (`NAAM-YYYY-XXXXX`).
- **ADR-008:** Approved formal Complaint Lifecycle State Machine engine with role-based transition validation, immutable audit log history in `complaint_updates`, citizen appeal workflows, and bilingual status reporting.
- **ADR-009:** Approved Department Authority Triage Queue and Mobile Field Officer Inspection Desk architecture with turn-by-turn GPS routing links, field assignment dispatching, and mandatory photographic resolution proof.
- **ADR-010:** Approved Interactive Leaflet Geolocation & Sanitized Spatial Query Architecture with PostGIS bounding-box (`GET /map/clusters`) and radial proximity queries (`GET /map/nearby`), strict PII exclusion for public map layers, severity-color-coded SVG pin markers, and client-side device GPS alignment.
- **ADR-011:** Approved Environmental Alert Broadcast System & In-App Notification Dispatch Architecture with official emergency banner tickers, source credibility taxonomy (`OFFICIAL_WARNING`, `COMMUNITY_REPORT`, `SIMULATED_DEMO_ALERT`), automated lifecycle event triggers for status transitions and officer task assignments, and unread notification bell dropdowns.
- **ADR-012:** Approved Super Admin Console Architecture (`/admin`) with role-based privilege enforcement (`SUPER_ADMIN`), user role reassignment and activation toggling, department master configuration, system telemetry KPI cards, and immutable security audit log recording with actor IP and JSON event metadata.
- **ADR-013:** Approved Environmental Analytics & Intelligence Architecture (`/analytics`) utilizing Recharts (category distribution pie chart, intake vs resolution trend area chart, and 14 Kerala district performance bar chart), combined payload endpoint (`GET /api/v1/analytics/summary`), and UTF-8-BOM CSV export.
- **ADR-014:** Approved Full Bilingual Architecture & WCAG 2.1 AA Accessibility Standards with 7 modular JSON locale dictionaries (`common`, `auth`, `community`, `complaints`, `authority`, `admin`, `analytics`), user language preference persistence (`users.preferred_language`, `PATCH /auth/me/language`), bilingual error handling middleware, and keyboard navigation enhancements (`SkipToContent`, ARIA labels).
- **ADR-015:** Approved Security Hardening, Rate Limiting, and Full End-to-End Integration Architecture with SlowAPI rate limiting, standard OWASP security header middleware (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.), XSS sanitization on complaint submission, and comprehensive E2E journey testing.
- **ADR-016:** Approved Production Deployment & DevOps Architecture with multi-stage Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`), `docker-compose.yml` local/private-cloud stack with PostGIS and Nginx reverse proxy, Vercel SPA deployment rules (`frontend/vercel.json`), Render blueprint (`render.yaml`), and comprehensive DevOps manual `docs/18_DEPLOYMENT_AND_DEVOPS.md`.
- **ADR-017:** Approved Final Project Integration, Handover, and System Sign-off. Validated all 16 delivery phases (Phases 00 through 15), confirmed 100% test pass rate across 52 backend integration tests, zero frontend build/lint errors, synchronized permanent documentation, and published comprehensive bilingual user manuals.

## 2. User Approvals Log
| Date | Milestone / Phase | Decision / Instruction | Approved By |
|---|---|---|---|
| 2026-11-21 | Master Architecture & Docs | Master development prompt initialized; comprehensive documentation generated. | User Approved ("yes") |
| 2026-11-21 | Phase 00: Environment Setup | Windows 11 environment verified: Node v22.14, npm 10.9.2, Python 3.12.10, uv 0.13.9, Git 2.56.1. | Completed & Verified |
| 2026-11-21 | Phase 01: Repository Foundation | Scaffolding complete: branch phase-01-foundation, frontend Vite+React+TS build passing, backend FastAPI+uv passing tests. | Completed & Verified |
| 2026-11-22 | Phase 02: UI/UX & Design System | Noto Sans Malayalam, color tokens, StatusBadge (8 states), Button, Card, Input, LanguageSwitcher, and /design-system showcase verified. | Completed & Verified |
| 2026-11-22 | Phase 03: Database Foundation | SQLAlchemy 2.0 models, pure-Python driver support (pg8000/sqlite), idempotent master data seeder (4 roles, 4 departments), test suite passing. | Completed & Verified |
| 2026-11-22 | Phase 04: Authentication & RBAC | Multi-portal auth (/login/community, /login/authority, /login/officer, /login/admin), citizen register, JWT rotation, ProtectedRoute guards, 11/11 tests passing. | Completed & Verified |
| 2026-11-22 | Phase 05: Community Portal | 4-step Complaint Wizard, Leaflet pin dropper, photo evidence preview, tracking codes, Citizen Dashboard, My Reports, Public Tracker, 15/15 tests passing. | User Approved ("do according git pushes also") |
| 2026-11-22 | Phase 06: Complaint Lifecycle | State machine engine, status transition endpoint, audit trail log, visual timeline, ComplaintDetail with interactive role actions, 19/19 tests passing. | User Approved ("do") |
| 2026-11-22 | Branding: Official Logo | Integrated official NAAM logo in headers, hero section, favicon, auth views, and design showcase. | User Approved ("add this as a logo") |
| 2026-11-22 | Phase 07: Authority & Officer | Authority triage dashboard, officer assignment modal, mobile task desk, GPS routing links, resolution proof photos, 20/20 tests passing. | User Approved ("do phase 7") |
| 2026-11-22 | Phase 08: Maps & Geolocation | Public interactive Leaflet map (/map), category/status/district filter bar, sanitized geo feeds, nearby proximity queries, 25/25 tests passing. | Executed & Verified |
| 2026-11-22 | Phase 09: Alerts & Notifications | Public emergency warning banner, authority broadcast modal, notification lifecycle dispatch service, unread notification bell dropdown, 30/30 tests passing. | User Approved ("do next phase") |
| 2026-11-22 | Phase 10: Super Admin Dashboard | Admin telemetry KPIs, user role & activation management, department editor, security audit log viewer, 35/35 tests passing. | User Approved ("do phase 10") |
| 2026-11-22 | Phase 11: Analytics & Reporting | Analytics dashboard (/analytics), Recharts category distribution, trend area chart, district bar chart, CSV report export, 43/43 tests passing. | Executed & Verified |
| 2026-11-22 | Phase 12: Bilingual & Accessibility | Modular JSON dictionaries (7 modules), user language persistence in DB, bilingual error middleware, SkipToContent component, 45/45 tests passing. | User Approved ("do phase 12") |
| 2026-11-22 | Phase 13: Security & Integration | Security header middleware, SlowAPI rate limiting, XSS input sanitization, complete E2E lifecycle journey, 52/52 tests passing. | User Approved ("yes") |
| 2026-11-22 | Phase 14: Deployment & DevOps | Multi-stage Dockerfiles, docker-compose orchestration, Vercel SPA rewrites, Render blueprint, and production DevOps manual. | User Approved ("do it") |
| 2026-11-22 | Phase 15: Final Integration | 100% project completion, bilingual user manuals, demonstration credentials verified, final system handover sign-off. | User Approved ("do") |
