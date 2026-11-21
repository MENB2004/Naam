# 22. NAAM (നാം) — Risk Register & Mitigation Strategy

| Risk ID | Description | Impact | Probability | Mitigation Strategy |
|---|---|:---:|:---:|---|
| **RSK-01** | PostGIS installation issues on native Windows 11. | High | Medium | Provide Docker Compose PostGIS fallback alongside native EDB PostGIS instructions. |
| **RSK-02** | Malayalam font rendering defects on mobile devices. | Medium | Low | Bundle web fonts (`Noto Sans Malayalam`) locally in `frontend/src/assets/fonts/`. |
| **RSK-03** | Inaccurate citizen GPS readings in rural areas. | Medium | High | Support interactive Leaflet drag-and-drop map pin adjustment with landmark descriptions. |
| **RSK-04** | Large photo uploads exhausting server storage or bandwidth. | High | Medium | Enforce client-side compression (max 1920x1080) and 5MB server-side payload limits. |
| **RSK-05** | Unauthorized complaint status alterations. | High | Low | Enforce strict RBAC checks at FastAPI route and service layers; verify assigning officer ownership. |
