# PHASE 10: Super Admin Dashboard

## 1. Phase Number
Phase 10

## 2. Phase Title
Super Admin Dashboard

## 3. Objective
Build the centralized system administration dashboard for user management, master data, and security audit logs.

## 4. Scope
Super Admin dashboard (`/admin`), user role management, department configuration, audit log viewer, platform health metrics.

## 5. Prerequisites
Phase 09 completed.

## 6. Dependencies
React, TanStack Query, shadcn/ui Table, Lucide React.

## 7. Detailed Tasks
- [ ] Build Super Admin layout with administrative navigation (`/admin/users`, `/admin/departments`, `/admin/audit-logs`)
- [ ] Implement User Management view with role assignment and account activation toggles
- [ ] Implement Department & LSGD Ward configuration editor
- [ ] Build Security Audit Log viewer displaying IP addresses, timestamps, actions, and actors
- [ ] Implement backend administration endpoints with strict `SUPER_ADMIN` role guard
- [ ] Add seed data management and demo data reset capabilities

## 8. Commands to Execute
```powershell
cd frontend
npm run build
```

## 9. Files to Create
- `frontend/src/features/admin/AdminDashboard.tsx`
- `frontend/src/features/admin/UserManagement.tsx`
- `frontend/src/features/admin/DepartmentManagement.tsx`
- `frontend/src/features/admin/AuditLogViewer.tsx`
- `backend/app/api/v1/endpoints/admin.py`

## 10. Existing Files to Modify
- `frontend/src/app/router.tsx`
- `backend/app/api/v1/api.py`

## 11. Database Changes
Read and update `users`, `departments`, `roles`, and query `audit_logs`.

## 12. API Changes
`GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}/role`, `GET /api/v1/admin/audit-logs`.

## 13. Frontend Changes
Comprehensive administrative table views with filtering, pagination, and search.

## 14. Backend Changes
Admin service with audit trail generation for all administrative actions.

## 15. Security Considerations
Strictly enforce that non-super admins receive 403 Forbidden on all `/api/v1/admin/*` endpoints.

## 16. Testing Requirements
Test role escalation block: verify standard user cannot access admin APIs.

## 17. Expected Output
Super Admin can view system telemetry, update roles, edit departments, and review security logs.

## 18. Acceptance Criteria
Audit log records administrative actions accurately; role changes take immediate effect.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_admin.py
```

## 20. Error Recovery
If admin access is denied, confirm super admin user record in `user_roles`.

## 21. Completion Checklist
- [ ] Admin layout & navigation complete
- [ ] User role editor functional
- [ ] Audit log viewer operational
- [ ] Super Admin security tests pass

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
