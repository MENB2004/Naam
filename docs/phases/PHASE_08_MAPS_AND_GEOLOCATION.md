# PHASE 08: Maps and Geolocation

## 1. Phase Number
Phase 08

## 2. Phase Title
Maps and Geolocation

## 3. Objective
Develop the public interactive environmental issue map using Leaflet and PostGIS spatial clustering.

## 4. Scope
Interactive map view (`/map`), category filtering, status color-coded markers, popup cards, PostGIS bounding-box & radial query endpoints.

## 5. Prerequisites
Phase 07 completed.

## 6. Dependencies
Leaflet, React-Leaflet, GeoAlchemy2, PostGIS.

## 7. Detailed Tasks
- [ ] Build public Map View (`frontend/src/features/maps/IssueMap.tsx`) with category and status filter controls
- [ ] Implement custom SVG map marker icons color-coded by severity and category
- [ ] Build interactive marker popup card displaying title in Malayalam, photo thumbnail, status badge, and date
- [ ] Implement backend spatial endpoint `GET /api/v1/map/clusters` using PostGIS bounding box queries
- [ ] Implement `GET /api/v1/map/nearby` endpoint calculating spatial distances with `ST_DWithin`
- [ ] Verify map boundary clipping strictly inside Kerala coordinates

## 8. Commands to Execute
```powershell
cd frontend
npm run build
```

## 9. Files to Create
- `frontend/src/features/maps/IssueMap.tsx`
- `frontend/src/features/maps/MapFilterBar.tsx`
- `backend/app/api/v1/endpoints/maps.py`

## 10. Existing Files to Modify
- `frontend/src/app/router.tsx`
- `backend/app/api/v1/api.py`

## 11. Database Changes
Utilize spatial index `idx_locations_geom` on `locations.geom`.

## 12. API Changes
`GET /api/v1/map/clusters`, `GET /api/v1/map/nearby`.

## 13. Frontend Changes
Responsive full-height interactive map with floating filter pill and Malayalam controls.

## 14. Backend Changes
PostGIS GeoJSON serialization, spatial envelope filtering.

## 15. Security Considerations
Sanitize public map responses: omit reporter PII (phone number, email, full name).

## 16. Testing Requirements
Verify spatial query performance with 1,000 simulated points (< 100ms response).

## 17. Expected Output
Interactive map displays complaints across Kerala with smooth zoom, filtering, and popups.

## 18. Acceptance Criteria
Map markers load accurately; clicking marker displays complaint summary in Malayalam.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_maps.py
```

## 20. Error Recovery
If Leaflet CSS marker icons fail to load, ensure leaflet CSS is imported in index.html.

## 21. Completion Checklist
- [ ] Leaflet map container rendered
- [ ] PostGIS bounding box query operational
- [ ] Markers color-coded by severity
- [ ] PII excluded from public geo feeds

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
