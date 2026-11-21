# PHASE 11: Analytics and Reporting

## 1. Phase Number
Phase 11

## 2. Phase Title
Analytics and Reporting

## 3. Objective
Develop aggregate environmental analytics, resolution metrics, and category trend visualizations using Recharts.

## 4. Scope
Analytics dashboard (`/analytics`), category distribution pie charts, resolution rate bar charts, district comparison tables.

## 5. Prerequisites
Phase 10 completed.

## 6. Dependencies
Recharts, SQLAlchemy aggregations, TanStack Query.

## 7. Detailed Tasks
- [ ] Build Analytics Dashboard view (`/analytics`) with interactive metric cards
- [ ] Implement Category Distribution chart (Waste, Water, Drainage, Flood) using Recharts
- [ ] Implement Resolution SLA performance bar chart comparing districts
- [ ] Build backend aggregation endpoints (`/api/v1/analytics/overview`, `/category-distribution`)
- [ ] Add export capability (CSV / JSON) for environmental reports
- [ ] Verify aggregate calculations against raw database counts

## 8. Commands to Execute
```powershell
cd frontend
npm run build
```

## 9. Files to Create
- `frontend/src/features/analytics/AnalyticsDashboard.tsx`
- `frontend/src/features/analytics/CategoryPieChart.tsx`
- `frontend/src/features/analytics/ResolutionTrendChart.tsx`
- `backend/app/api/v1/endpoints/analytics.py`

## 10. Existing Files to Modify
- `backend/app/api/v1/api.py`

## 11. Database Changes
Optimized SQL `COUNT()` and `GROUP BY` aggregation queries.

## 12. API Changes
`GET /api/v1/analytics/overview`, `GET /api/v1/analytics/trends`.

## 13. Frontend Changes
Responsive charts with Malayalam tooltips and color-coded environmental indicators.

## 14. Backend Changes
Analytical aggregation repository with query caching.

## 15. Security Considerations
Ensure aggregated analytics do not leak private citizen details.

## 16. Testing Requirements
Verify math: sum of category percentages equals 100%; totals match database rows.

## 17. Expected Output
Visual charts render live database metrics cleanly with Malayalam labels.

## 18. Acceptance Criteria
Charts are interactive, responsive on mobile devices, and update when new complaints are added.

## 19. Verification Commands
```powershell
cd backend; uv run pytest tests/test_analytics.py
```

## 20. Error Recovery
If chart data is empty, seed demo complaints using the seed script.

## 21. Completion Checklist
- [ ] Analytics dashboard built
- [ ] Recharts visualizations functional
- [ ] Malayalam tooltips working
- [ ] Aggregate SQL queries optimized

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
