# 05. NAAM (നാം) — Technology Stack

## 1. Full Technology Matrix

| Domain | Technology / Library | Version | Rationale & Selection Criteria |
|---|---|---|---|
| **Frontend Framework** | React | 18.3+ | Industry standard, robust component model, optimal for complex dashboards. |
| **Language (Frontend)** | TypeScript | 5.5+ | Strict type safety, prevents runtime bugs in multi-portal state management. |
| **Build Tool** | Vite | 5.4+ | Instant HMR (Hot Module Replacement) and fast production bundling. |
| **CSS Framework** | Tailwind CSS | 3.4+ | Utility-first CSS, rapid responsive development, easy theme tokens. |
| **UI Primitives** | shadcn/ui + Radix UI | Latest | Unstyled, fully accessible (WCAG AA), accessible keyboard navigation. |
| **Routing** | React Router | 6.26+ | Declarative nested routing, role-based route guard wrappers. |
| **Server State** | TanStack Query v5 | 5.50+ | Cache invalidation, query deduplication, optimistic mutation UI. |
| **Client State** | Zustand | 4.5+ | Lightweight, zero-boilerplate client state for language and map viewport. |
| **Forms & Validation**| React Hook Form + Zod | Latest | Performant uncontrolled forms with declarative schema validation. |
| **Localization** | i18next + react-i18next | 23.x+ | Seamless Malayalam-first bilingual switching with JSON locale files. |
| **Icons** | Lucide React | Latest | Clean, consistent, tree-shakeable SVG icon set. |
| **Data Visualization** | Recharts | 2.12+ | Composable charting library for environmental metrics & status analytics. |
| **Interactive Maps** | Leaflet + React-Leaflet | 1.9+ | Lightweight, open-source mapping with OpenStreetMap & custom tiles. |
| **Backend Framework** | FastAPI | 0.115+ | High performance asynchronous Python web framework with auto OpenAPI docs. |
| **Language (Backend)** | Python | 3.12+ | Clean syntax, robust scientific and geospatial ecosystem. |
| **ASGI Server** | Uvicorn (standard) | 0.30+ | High-throughput async ASGI web server for production. |
| **ORM** | SQLAlchemy 2.0 (async) | 2.0.32+ | Mature, type-annotated ORM supporting complex relational models. |
| **Spatial Extension** | GeoAlchemy2 | 0.15+ | Seamless integration of PostGIS spatial types with SQLAlchemy. |
| **Database Migrations**| Alembic | 1.13+ | Version-controlled, reproducible database schema migrations. |
| **Data Validation** | Pydantic v2 | 2.8+ | Rust-backed ultra-fast data validation and serialization. |
| **Password Hashing** | pwdlib (Argon2id) | Latest | Modern memory-hard password hashing recommended by OWASP. |
| **Token Handling** | PyJWT | 2.9+ | Cryptographically secure JWT creation, encoding, and verification. |
| **Database Engine** | PostgreSQL | 16.x | Robust, ACID-compliant enterprise relational database. |
| **GIS Extension** | PostGIS | 3.4+ | Advanced spatial data types, spatial indexing, distance calculations. |
| **Testing (Backend)** | Pytest + pytest-asyncio | 8.x+ | Industry standard Python unit, API, and integration test suite. |
| **HTTP Client** | HTTPX | 0.27+ | Async HTTP client for integration and end-to-end API testing. |
| **Linter & Formatter**| Ruff | Latest | Extremely fast Python linter and code formatter. |

---

## 2. Infrastructure & Hosting Strategy
- **Frontend Hosting:** Vercel (Edge CDN, automatic HTTPS, preview branches).
- **Backend Hosting:** Render / Koyeb / Railway (Containerized Python ASGI service with persistent health-checks).
- **Database Hosting:** Managed PostgreSQL with PostGIS support (Neon, Supabase, or Render PostgreSQL).
- **Object Storage:** Supabase Storage or AWS S3-compatible bucket with pre-signed upload URLs.
