# PHASE 05: Community Portal and Complaint Reporting

## 1. Phase Number
Phase 05

## 2. Phase Title
Community Portal and Complaint Reporting

## 3. Objective
Build the citizen-facing portal for submitting geo-tagged environmental complaints, uploading photographs, and tracking complaint history.

## 4. Scope
Complaint reporting wizard, category selector in Malayalam, photo preview/uploader, Leaflet pin dropper, citizen dashboard.

## 5. Prerequisites
Phase 04 completed.

## 6. Dependencies
React Hook Form, Zod, Leaflet, React-Leaflet, TanStack Query.

## 7. Detailed Tasks
- [ ] Build Citizen Dashboard view (`/community/dashboard`) with active reports overview
- [ ] Implement Complaint Wizard (`/community/report`): Step 1 Category, Step 2 Details & Photos, Step 3 Map Location
- [ ] Integrate Leaflet pin-drop component for pinpointing issue location with Kerala coordinate bounds validation
- [ ] Implement client-side photo compression and multi-image upload preview
- [ ] Build backend `POST /api/v1/complaints` handling multipart data, coordinate persistence, and evidence records
- [ ] Build Citizen Complaint History view (`/community/my-reports`) with status badges and timeline

## 8. Commands to Execute
```powershell
cd frontend
npm run dev
```

## 9. Files to Create
- `frontend/src/features/community/ComplaintWizard.tsx`
- `frontend/src/features/community/CitizenDashboard.tsx`
- `frontend/src/features/community/MyReports.tsx`
- `backend/app/api/v1/endpoints/complaints.py`

## 10. Existing Files to Modify
- `frontend/src/app/router.tsx`
- `backend/app/api/v1/api.py`

## 11. Database Changes
Inserts into `complaints`, `locations`, and `evidence` tables.

## 12. API Changes
`POST /api/v1/complaints`, `GET /api/v1/complaints/me`.

## 13. Frontend Changes
Responsive mobile-friendly wizard with Malayalam instructions and live photo preview.

## 14. Backend Changes
Complaint creation service with automatic tracking code generator (`NAAM-YYYY-XXXXX`).

## 15. Security Considerations
File validation: check MIME types (JPEG/PNG/WebP), file size ≤ 5MB, sanitize coordinate inputs.

## 16. Testing Requirements
End-to-end API test creating complaint with location and evidence photo.

## 17. Expected Output
Citizen can fill form, select map location, attach photo, and receive unique tracking code.

## 18. Acceptance Criteria
Complaint is stored in database with status `SUBMITTED`, PostGIS point geometry, and linked evidence.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_complaints.py -k test_create_complaint
```

## 20. Error Recovery
If coordinates fall outside Kerala bounds, display Malayalam error: 'ദയവായി കേരളത്തിനകത്തുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക'.

## 21. Completion Checklist
- [ ] Citizen dashboard functional
- [ ] Complaint wizard operational
- [ ] Leaflet location picker working
- [ ] Photo upload validated
- [ ] Unique tracking code generated

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
