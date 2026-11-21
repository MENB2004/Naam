# NAAM (നാം)
### ജനകീയ പരിസ്ഥിതി നിരീക്ഷണവും പരിഹാരവേദിയും
### People's Environmental Monitoring and Resolution Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-green.svg)](https://postgis.net)

---

## 1. Overview
**NAAM (നാം)** is a Malayalam-first, location-aware community environmental issue reporting and monitoring platform connecting citizens of Kerala with Local Self-Government Institutions (Grama Panchayats, Municipalities, Corporations) and departments (Suchitwa Mission, Haritha Karma Sena, KSPCB, Irrigation Department).

## 2. Architecture & Modules
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Leaflet, i18next (Malayalam & English).
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (async), GeoAlchemy2, Pydantic v2, uv.
- **Database:** PostgreSQL 16 with PostGIS 3.4 spatial extensions.
- **Portals:**
  - Citizen / Community Portal (`/community`)
  - LSGD & Department Authority Portal (`/authority`)
  - Field Officer Portal (`/officer`)
  - Super Admin Dashboard (`/admin`)

## 3. Getting Started

### Prerequisites
- Node.js 22+ & npm 10+
- Python 3.12+
- Astral uv
- PostgreSQL 16 with PostGIS extension

### Backend Setup
```powershell
cd backend
uv venv
.\.venv\Scripts\Activate.ps1
uv pip install -e .
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

Visit the application at: `http://localhost:5173`
API documentation at: `http://localhost:8000/docs`

## 4. Documentation
Comprehensive architecture, schema specifications, and phase plans are located in the [`docs/`](./docs/) directory.
