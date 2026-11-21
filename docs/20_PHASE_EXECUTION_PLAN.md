# 20. NAAM (നാം) — Complete Phase Execution Plan (00 to 15)

## 1. Phase Roadmap Overview

| Phase | Phase Name | Primary Deliverable | Verification Checkpoint |
|:---:|---|---|---|
| **00** | Environment Setup & Verification | Windows 11 toolchain verified (`uv`, Python, Node.js, Docker/PostgreSQL) | Clean version checks & health status |
| **01** | Repository & Foundation | Project scaffolding, clean Git branch, directory structure | Repository builds, clean branch `phase-01-foundation` |
| **02** | UI/UX & Design System | Design tokens, Malayalam typography, shadcn/ui components | UI component catalog renders correctly |
| **03** | Database & Backend Foundation | PostgreSQL + PostGIS schemas, Alembic migrations, FastAPI core | Database migrations apply, `/health` passes |
| **04** | Authentication & RBAC | Multi-portal login, Argon2id, JWT, role guards | Auth tests pass for all 4 roles |
| **05** | Community Portal | Citizen complaint wizard, photo upload, complaint tracking | Citizen can submit complaint with photo |
| **06** | Complaint Management | State machine (`SUBMITTED` to `VERIFIED`), timeline audit | Valid transitions succeed, invalid transitions reject |
| **07** | Authority & Officer Portals | LSGD triage dashboard, officer assignment, resolution proof | Officer can resolve with before-after proof |
| **08** | Maps & Geolocation | Leaflet interactive map, PostGIS spatial queries, clustering | Map displays pins inside Kerala bounds |
| **09** | Alerts & Notifications | In-app notifications, official warning broadcast system | Status change triggers notification to citizen |
| **10** | Super Admin Dashboard | User/Department management, audit log viewer, system metrics | Admin can manage roles & view audit logs |
| **11** | Analytics & Reporting | Recharts visualization, category breakdown, resolution metrics | Charts render live database aggregations |
| **12** | Bilingual & Accessibility | Complete Malayalam locale, English toggle, WCAG AA compliance | Zero missing translation keys, contrast passes |
| **13** | Security & Testing | Pytest suite, security audit, input validation, rate limiting | 100% core test suites passing |
| **14** | Deployment | Vercel (frontend) + Render/Managed DB (backend) deployment | Live URLs accessible and verified |
| **15** | Final Integration & Handover | End-to-end user journeys, permanent documentation update | Full demonstration sign-off |
