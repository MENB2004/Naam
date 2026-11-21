# PHASE 07: Authority and Field Officer Portals

## 1. Phase Number
Phase 07

## 2. Phase Title
Authority and Field Officer Portals

## 3. Objective
Build the administrative triage dashboard for LSGD/Department authorities and the mobile task execution view for Field Officers.

## 4. Scope
Authority complaint triage dashboard, officer assignment modal, Field Officer task list, and resolution proof submission with before-and-after photo upload.

## 5. Prerequisites
Phase 06 completed.

## 6. Dependencies
React, TanStack Query, Recharts, Leaflet.

## 7. Detailed Tasks
- [ ] Build Authority Dashboard (`/authority/dashboard`): complaint inbox, filtering by ward & category, SLA indicators
- [ ] Build Officer Assignment modal allowing department authority to designate Field Officer and deadline
- [ ] Implement backend assignment endpoint `POST /api/v1/complaints/{id}/assign`
- [ ] Build Field Officer Portal (`/officer/tasks`): mobile-first task list with GPS navigation links
- [ ] Build Resolution Proof form for Field Officer with mandatory resolution photo and inspection notes
- [ ] Implement citizen resolution verification flow (Confirm resolution or Reopen with remarks)

## 8. Commands to Execute
```powershell
cd frontend
npm run build
```

## 9. Files to Create
- `frontend/src/features/authorities/AuthorityDashboard.tsx`
- `frontend/src/features/authorities/AssignOfficerModal.tsx`
- `frontend/src/features/field-officer/OfficerTaskList.tsx`
- `frontend/src/features/field-officer/ResolutionProofModal.tsx`

## 10. Existing Files to Modify
- `frontend/src/app/router.tsx`
- `backend/app/api/v1/endpoints/assignments.py`

## 11. Database Changes
Inserts into `complaint_assignments` and updates complaint status to `ASSIGNED`.

## 12. API Changes
`POST /api/v1/complaints/{id}/assign`, `GET /api/v1/officer/tasks`, `POST /api/v1/complaints/{id}/resolve`.

## 13. Frontend Changes
Desktop triage table for authorities; high-contrast mobile view for field officers.

## 14. Backend Changes
Assignment dispatch logic, notification dispatching, resolution proof recording.

## 15. Security Considerations
Verify that only officers assigned to a complaint can upload resolution proof.

## 16. Testing Requirements
Test complete workflow from assignment by authority to resolution by field officer.

## 17. Expected Output
Authority can assign complaints; field officer receives task, updates progress, and submits resolution proof.

## 18. Acceptance Criteria
Status moves from `SUBMITTED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` with evidence.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_assignments.py
```

## 20. Error Recovery
If officer assignment fails, check user role validity in `user_roles`.

## 21. Completion Checklist
- [ ] Authority dashboard functional
- [ ] Officer assignment working
- [ ] Field officer portal operational
- [ ] Resolution proof with photos verified

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
