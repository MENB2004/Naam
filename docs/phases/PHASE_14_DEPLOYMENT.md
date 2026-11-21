# PHASE 14: Deployment and DevOps

## 1. Phase Number
Phase 14

## 2. Phase Title
Deployment and DevOps

## 3. Objective
Deploy the NAAM platform to production: Frontend to Vercel, Backend to Render (or approved host), and Managed PostgreSQL + PostGIS.

## 4. Scope
Production build configuration, Dockerfile, environment configuration, database migrations on production, live URL verification.

## 5. Prerequisites
Phase 13 completed and user approval granted for deployment targets.

## 6. Dependencies
Vercel CLI / Web, Render / Koyeb, Managed PostgreSQL (Neon / Supabase).

## 7. Detailed Tasks
- [ ] Obtain user approval for deployment hosts, database provider, and domain configuration
- [ ] Create production `Dockerfile` for backend ASGI service
- [ ] Configure `vercel.json` for frontend SPA routing and reverse proxy rules
- [ ] Provision managed PostgreSQL database and enable PostGIS extension
- [ ] Execute production database migrations using Alembic (`alembic upgrade head`)
- [ ] Deploy backend container to Render / approved cloud host and verify `/health` endpoint
- [ ] Deploy frontend to Vercel and verify live HTTPS connection to backend API
- [ ] Perform smoke tests on the live deployed URL across mobile and desktop

## 8. Commands to Execute
```powershell
# Deployment build commands
cd frontend
npm run build
cd ..\backend
uv lock
```

## 9. Files to Create
- `backend/Dockerfile`
- `frontend/vercel.json`
- `docs/18_DEPLOYMENT_AND_DEVOPS.md` (Update live URLs)

## 10. Existing Files to Modify
- `frontend/.env.production`
- `backend/.env.production.example`

## 11. Database Changes
Run migrations on live managed database; seed initial administrative user.

## 12. API Changes
Live production endpoints active over HTTPS.

## 13. Frontend Changes
Live frontend communicating with production backend.

## 14. Backend Changes
Production ASGI server running with workers and SSL termination.

## 15. Security Considerations
Ensure production database credentials and JWT secrets are configured via host secret managers, not committed.

## 16. Testing Requirements
Live smoke test: user registration, complaint creation, and map rendering on production URL.

## 17. Expected Output
Fully operational live demonstration deployment accessible via public URL.

## 18. Acceptance Criteria
Live frontend and backend URLs return 200 OK and complete end-to-end workflows.

## 19. Verification Commands
```powershell
curl -I https://<LIVE-BACKEND-URL>/health
```

## 20. Error Recovery
If production migration fails, inspect database user permissions for PostGIS extension creation.

## 21. Completion Checklist
- [ ] User approval obtained for hosting
- [ ] Production database migrated
- [ ] Backend deployed and healthy
- [ ] Frontend deployed to Vercel
- [ ] Live smoke tests verified

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
