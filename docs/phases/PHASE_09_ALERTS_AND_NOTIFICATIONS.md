# PHASE 09: Alerts and Notifications

## 1. Phase Number
Phase 09

## 2. Phase Title
Alerts and Notifications

## 3. Objective
Implement the environmental alert broadcast system and user notification feed.

## 4. Scope
In-app notifications for citizens & officers, official warning broadcast banner, alert management API, clear data source badges.

## 5. Prerequisites
Phase 08 completed.

## 6. Dependencies
FastAPI, TanStack Query, Lucide React.

## 7. Detailed Tasks
- [ ] Build Notification dropdown menu in PortalHeader with unread counter badge
- [ ] Implement backend notification generation upon complaint status transitions and assignments
- [ ] Build notification listing and mark-as-read endpoints
- [ ] Build Environmental Alert broadcast panel for Authorities and Super Admins
- [ ] Implement public top-banner alert ticker displaying official emergency warnings
- [ ] Enforce strict data source tagging (`OFFICIAL_WARNING` vs `COMMUNITY_REPORT` vs `SIMULATED_DEMO_ALERT`)

## 8. Commands to Execute
```powershell
cd backend
uv run pytest tests/test_notifications.py
```

## 9. Files to Create
- `frontend/src/features/alerts/AlertBanner.tsx`
- `frontend/src/features/alerts/BroadcastAlertModal.tsx`
- `frontend/src/components/layout/NotificationDropdown.tsx`
- `backend/app/api/v1/endpoints/alerts.py`

## 10. Existing Files to Modify
- `backend/app/api/v1/endpoints/notifications.py`

## 11. Database Changes
Inserts into `alerts` and `notifications` tables.

## 12. API Changes
`GET /api/v1/alerts`, `POST /api/v1/alerts`, `GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`.

## 13. Frontend Changes
Top ticker banner for critical alerts; animated notification drawer for personal updates.

## 14. Backend Changes
Notification dispatch service hooked into complaint lifecycle events.

## 15. Security Considerations
Ensure only authorized officials can broadcast official alerts; prevent simulated alerts from being disguised.

## 16. Testing Requirements
Verify notification trigger on complaint status transition from `SUBMITTED` to `UNDER_REVIEW`.

## 17. Expected Output
Citizens receive real-time notification alerts; emergency banners render prominently across the app.

## 18. Acceptance Criteria
Alerts display distinct visual badges indicating source credibility; notifications update in-app.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_alerts.py
```

## 20. Error Recovery
If notifications fail to load, check user ID match in auth token claims.

## 21. Completion Checklist
- [ ] In-app notifications functional
- [ ] Official alert banner operational
- [ ] Data source classification enforced
- [ ] Notification badge updates correctly

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
