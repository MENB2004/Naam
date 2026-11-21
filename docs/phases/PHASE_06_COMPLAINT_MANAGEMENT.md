# PHASE 06: Complaint Management Lifecycle

## 1. Phase Number
Phase 06

## 2. Phase Title
Complaint Management Lifecycle

## 3. Objective
Implement the full 6-stage complaint state machine (`SUBMITTED` to `VERIFIED`), status transition rules, and audit logging.

## 4. Scope
Backend state machine engine, transition validation, status update API, visual status timeline component.

## 5. Prerequisites
Phase 05 completed.

## 6. Dependencies
SQLAlchemy 2.0, FastAPI, TanStack Query.

## 7. Detailed Tasks
- [ ] Implement complaint state machine service enforcing valid state transitions
- [ ] Implement `POST /api/v1/complaints/{id}/status` endpoint with role-based transition authorization
- [ ] Record transition audit record in `complaint_updates` table upon every status change
- [ ] Build visual Status Timeline component (`frontend/src/features/complaints/ComplaintTimeline.tsx`) in Malayalam
- [ ] Implement complaint detail view with status history, responsible officer, and remarks
- [ ] Write comprehensive test suite verifying valid and invalid state transitions

## 8. Commands to Execute
```powershell
cd backend
uv run pytest tests/test_lifecycle.py
```

## 9. Files to Create
- `backend/app/services/complaint_state_machine.py`
- `frontend/src/features/complaints/ComplaintTimeline.tsx`
- `frontend/src/features/complaints/ComplaintDetail.tsx`

## 10. Existing Files to Modify
- `backend/app/api/v1/endpoints/complaints.py`

## 11. Database Changes
Insert row into `complaint_updates` for every transition; update `complaints.current_status`.

## 12. API Changes
`POST /api/v1/complaints/{id}/status`, `GET /api/v1/complaints/{id}/timeline`.

## 13. Frontend Changes
Visual step timeline showing dates, responsible officer, and bilingual status messages.

## 14. Backend Changes
Enforce state machine constraints (e.g. cannot transition directly from `SUBMITTED` to `RESOLVED`).

## 15. Security Considerations
Prevent unauthorized status changes; ensure only assigned officer can mark `IN_PROGRESS` or `RESOLVED`.

## 16. Testing Requirements
Unit tests for all 8 states including `REJECTED` and `REOPENED`.

## 17. Expected Output
Complaints transition smoothly through states with full historical audit records.

## 18. Acceptance Criteria
Invalid transitions return HTTP 400 with Malayalam error message; valid transitions update timeline.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_lifecycle.py
```

## 20. Error Recovery
If an invalid state transition is attempted, roll back database transaction and return descriptive error.

## 21. Completion Checklist
- [ ] State machine service implemented
- [ ] Audit log written on every change
- [ ] Visual timeline component rendered
- [ ] Lifecycle test suite passes

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
