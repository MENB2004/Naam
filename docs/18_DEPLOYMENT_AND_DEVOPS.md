# 18. NAAM (നാം) — Production Deployment and DevOps Manual

## 1. Production Architecture Overview
The NAAM platform is engineered as a modern, decoupled cloud application with high availability, global edge delivery, and resilient database isolation.

```
+-------------------------------------------------------------+
|                      User Browser / App                     |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            | HTTPS / 443                         | HTTPS / 443
            v                                     v
+-----------------------+             +-----------------------+
|  Vercel Edge Network  |             |  Nginx Reverse Proxy  |
|  (Frontend SPA CDN)   |             |  (On-Premise / Cloud) |
+-----------+-----------+             +-----------+-----------+
            |                                     |
            | /api/v1/ (Reverse Proxy)            | /api/v1/ (Pass)
            +------------------+------------------+
                               |
                               v
                +------------------------------+
                |      FastAPI ASGI Server     |
                |  (Docker / Render / Railway) |
                +--------------+---------------+
                               |
                               v
                +------------------------------+
                |   PostgreSQL 16 + PostGIS    |
                |  (Neon / Supabase / Render)  |
                +------------------------------+
```

---

## 2. Cloud Deployment Targets

### A. Frontend on Vercel
1. **Live Production Status:**
   - **Production URL:** [https://frontend-nine-orpin-72.vercel.app](https://frontend-nine-orpin-72.vercel.app)
   - **Deployment Inspect:** [https://vercel.com/menbs-projects/frontend](https://vercel.com/menbs-projects/frontend)
   - **Project Name:** `menbs-projects/frontend`
   - **Status:** Deployed & Ready (`READY`, HTTP 200)
2. **Repository Connection:**
   - Link the GitHub repository: `https://github.com/MENB2004/Naam.git`.
   - Root Directory: `frontend`.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
3. **Configuration (`frontend/vercel.json`):**
   - Automatically handles Single-Page Application (SPA) routing fallbacks to `/index.html`.
   - Re-routes `/api/v1/:path*` directly to the production backend ASGI host.
   - Applies security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`).
4. **Environment Variables on Vercel:**
   - `VITE_API_URL`: `/api/v1` (or full backend URL `https://naam-backend.onrender.com/api/v1`).

---

### B. Backend on Render / Container Host
1. **Infrastructure as Code (`render.yaml`):**
   - Service Type: `web`.
   - Runtime: `docker` (`backend/Dockerfile`).
   - Healthcheck Path: `/health`.
2. **Environment Variables on Render:**
   - `DATABASE_URL`: Managed connection string with pure-Python driver: `postgresql+pg8000://...`.
   - `SECRET_KEY`: High-entropy 64-character secret generated via `openssl rand -hex 32`.
   - `BACKEND_CORS_ORIGINS`: `["https://naam.vercel.app","https://naam.kerala.gov.in"]`.
   - `ENVIRONMENT`: `production`.

---

### C. Managed Database (Neon / Supabase / Render PostgreSQL)
1. **PostGIS Activation:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
2. **Schema Migration:**
   ```powershell
   cd backend
   uv run alembic upgrade head
   ```
3. **Master Data Seeding:**
   ```powershell
   cd backend
   uv run python scripts/seed_master_data.py
   uv run python scripts/seed_demo_users.py
   ```

---

## 3. Local & On-Premises Deployment (Docker Compose)

To spin up the complete production-grade stack locally or in private government data centers:

```powershell
# 1. Clone repository
git clone https://github.com/MENB2004/Naam.git
cd Naam

# 2. Build and launch all containers in detached mode
docker compose up -d --build

# 3. Verify status
docker compose ps
```

### Services Exposed in Docker Compose:
| Service | Image / Build | Port | Purpose |
|---|---|---|---|
| `db` | `postgis/postgis:16-3.4-alpine` | `5432` | Relational + geospatial PostGIS engine |
| `backend` | `backend/Dockerfile` | `8000` | FastAPI ASGI application (4 Uvicorn workers) |
| `frontend` | `frontend/Dockerfile` | `80` (internal) | Pre-compiled React static assets served via Nginx |
| `proxy` | `nginx:alpine` | `80` | Unified ingress gateway & reverse proxy |

---

## 4. Production Security & Health Verification

1. **Verify Backend Health:**
   ```bash
   curl -I https://<LIVE-BACKEND-URL>/health
   ```
   *Expected Response:* `HTTP/1.1 200 OK` with JSON `{"status": "healthy", "service": "NAAM Central API"}` and security headers.

2. **Verify Frontend Live:**
   * Open `https://<LIVE-FRONTEND-URL>` in browser.
   * Verify Malayalam-first UI renders cleanly.
   * Verify `/map` renders Leaflet layer with Kerala boundary restrictions.
   * Verify `/analytics` renders live Recharts metrics and CSV download.

---

## 5. Rollback and Disaster Recovery Protocol
1. **Database Snapshots:** Daily automated backups with 30-day retention on managed PostgreSQL.
2. **Zero-Downtime Rollback:**
   - Frontend: Vercel instant deployment rollback to previous deployment hash in 1 click.
   - Backend: Docker image tagging with git commit SHA (`docker tag naam-backend:${GIT_COMMIT_SHA}`).
