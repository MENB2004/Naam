# 18. NAAM (നാം) — Deployment and DevOps Guide

## 1. Deployment Topology
- **Frontend:** Vercel (Edge Network, instant SSL, global CDN).
- **Backend:** Render / Koyeb / Railway (Containerized Python FastAPI runtime).
- **Database:** Managed PostgreSQL 16 with PostGIS (Neon, Supabase, or Render PostgreSQL).
- **Object Storage:** S3-compatible bucket or Supabase Storage.

---

## 2. Docker & Containerization Architecture
A root `docker-compose.yml` provides a unified local development environment:
- Container `postgres`: PostgreSQL 16 with PostGIS 3.4 pre-installed.
- Container `backend`: FastAPI server running Uvicorn with reload.
- Container `frontend`: Vite dev server with proxy to backend.
