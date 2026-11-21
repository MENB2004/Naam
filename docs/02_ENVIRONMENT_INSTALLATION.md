# 02. NAAM (നാം) — Environment Installation and Verification Guide

## 1. Target Machine Baseline
- **Operating System:** Windows 11 (Build 26300+)
- **Primary Shell:** Windows PowerShell 5.1 / PowerShell 7
- **Project Location:** `N:\Naam-dace`
- **Optional/Secondary Environment:** WSL2 Ubuntu (where required)

---

## 2. Current Environment Inspection Audit (Nov 2026)
An automated inspection of the host system yielded the following baseline status:

| Tool / Runtime | Required Version | Detected Status | Action Required |
|---|---|---|---|
| **Windows OS** | Windows 11 (64-bit) | Microsoft Windows 10.0.26300 | Compatible. Ready. |
| **PowerShell** | PS 5.1+ / PS 7+ | Active PowerShell | Ready. |
| **Git** | 2.40+ | `git version 2.56.1.windows.1` | Installed and working. |
| **Node.js** | 22.x LTS / 26.x | `v22.14.0` | Installed and working. |
| **npm** | 10.x+ | `10.9.2` | Installed and working. |
| **Python** | 3.12.x | `Python 3.12.10` (on PATH) | Installed. Virtual environment to be created. |
| **Python Launcher (`py`)** | Optional | Config error on `-3.12` | Use direct `python` executable. |
| **uv** | Latest | `uv 0.13.9` (Installed & Verified) | Ready for Python virtual env and packaging. |
| **VS Code** | 1.90+ | `1.145.3` (Installed) | Installed and working. |
| **WSL2** | Ubuntu (Optional) | Not installed | Optional; Windows-native development supported. |
| **Git User** | Configured | `MENB2004 <nb2004416@gmail.com>` | Configured and verified. |
| **PostgreSQL + PostGIS** | Postgres 15/16 + PostGIS 3.4 | Configured for Phase 3 | EnterpriseDB / Docker / Managed Cloud (Neon/Supabase). |

---

## 3. Step-by-Step Installation Instructions for Windows 11

### Step 3.1: Python Environment Setup & `uv` Installation
To install `uv` (fast Python package manager) natively on Windows PowerShell:

```powershell
# Option A: Official Astral installer for Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Option B: Fallback via Python pip
python -m pip install --upgrade pip
python -m pip install uv
```

Verify installation:
```powershell
uv --version
```

### Step 3.2: Backend Virtual Environment Setup
Always create a project-isolated virtual environment inside `backend/`:

```powershell
cd N:\Naam-dace\backend
python -m venv .venv
# Activate in PowerShell:
.\.venv\Scripts\Activate.ps1
# Verify Python path:
Get-Command python | Select-Object -ExpandProperty Source
```

> [!NOTE] Windows Application Control (WDAC) Workaround:
> On Windows 11 with Application Control policies enabled, running generated `.exe` stubs (like `uvicorn.exe` or `pytest.exe`) directly in `.venv\Scripts\` will be blocked by policy.
> Always invoke Python modules directly through the verified Python executable:
> - Start Backend: `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000`
> - Run Tests: `.\.venv\Scripts\python.exe -m pytest`
> - Run Migrations: `.\.venv\Scripts\python.exe -m alembic upgrade head`

*Note on PowerShell Execution Policy:*
If script execution is disabled, run once as Administrator or in the current user scope:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3.3: Node.js & Frontend Environment Verification
Node.js 22.14.0 and npm 10.9.2 are already installed and fully operational.
To verify:
```powershell
cd N:\Naam-dace\frontend
node --version
npm --version
```

### Step 3.4: PostgreSQL and PostGIS Setup
PostGIS spatial extension is mandatory for geo-queries (`ST_DWithin`, `ST_MakePoint`).

#### Approach A: Docker Desktop (Recommended for isolation)
1. Download Docker Desktop for Windows: `https://www.docker.com/products/docker-desktop/`
2. Enable WSL2 backend in Docker Desktop settings.
3. Start the bundled `docker-compose.yml`:
```powershell
docker compose up -d postgres
```

#### Approach B: Native Windows PostgreSQL + PostGIS (If Docker is not desired)
1. Download EnterpriseDB PostgreSQL 16 installer for Windows: `https://www.enterprisedb.com/downloads/postgres-postgresql-downloads`
2. At the end of installation, run **Application Stack Builder**.
3. Under **Spatial Extensions**, check **PostGIS 3.4 Bundle for PostgreSQL 16** and complete installation.
4. Verify via `psql`:
```sql
CREATE DATABASE naam_db;
\c naam_db;
CREATE EXTENSION postgis;
SELECT PostGIS_Version();
```

---

## 4. Environment Separation Principles
- **Windows vs WSL:** All commands in this guide default to native Windows 11 PowerShell. Do not mix WSL Linux virtual environments with Windows `.venv`.
- **Node Modules:** Never share `node_modules` between Windows and a WSL Linux mount due to native binary compilation differences.
- **Port Allocations:**
  - Frontend (Vite): `http://localhost:5173`
  - Backend (FastAPI): `http://localhost:8000`
  - PostgreSQL + PostGIS: `localhost:5432`
