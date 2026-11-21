# 10. NAAM (നാം) — REST API Specification (`/api/v1`)

## 1. Overview & Conventions
- **Base URL:** `/api/v1`
- **Data Format:** JSON (`application/json`) for standard endpoints; `multipart/form-data` for file uploads.
- **Authentication:** `Authorization: Bearer <access_token>` in HTTP request header.
- **Timestamp Format:** ISO 8601 UTC strings (e.g. `2026-11-21T14:10:00Z`).
- **Standard Error Response Structure:**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested complaint could not be found.",
    "message_ml": "നിങ്ങൾ തിരഞ്ഞ പരാതി കണ്ടെത്താനായില്ല.",
    "details": null
  }
}
```

---

## 2. API Endpoints Reference

### 2.1 System Health
- **`GET /health`**
  - Public endpoint.
  - Returns service status, database connectivity, and PostGIS extension status.

### 2.2 Authentication & User Profiles
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Citizen self-registration. |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials, issues access token & refresh cookie. |
| `POST` | `/api/v1/auth/refresh` | Cookie | Rotates refresh token and returns new access token. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revokes refresh token and clears session cookies. |
| `GET` | `/api/v1/auth/me` | Authenticated | Returns current authenticated user profile, roles, and permissions. |
| `PATCH` | `/api/v1/users/me` | Authenticated | Updates current user profile details (language preference, phone). |

### 2.3 Master Data & Organization
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/departments` | Authenticated | List all active departments & LSGD units. |
| `GET` | `/api/v1/categories` | Public | List complaint categories with bilingual titles and icons. |
| `GET` | `/api/v1/locations/districts` | Public | List Kerala districts and subordinate LSGD local bodies. |

### 2.4 Environmental Complaints Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/complaints` | Public / Filtered | List complaints with spatial bounding box, status, and category filters. |
| `POST` | `/api/v1/complaints` | Community / Admin | Submit new complaint with location coordinates and optional photos. |
| `GET` | `/api/v1/complaints/{id}` | Authenticated | Retrieve full complaint details, timeline history, and evidence. |
| `PATCH` | `/api/v1/complaints/{id}` | Authority / Admin | Update complaint metadata, category correction, or department routing. |
| `POST` | `/api/v1/complaints/{id}/status` | Authority / Officer / Citizen | Perform validated status transition (with remarks and evidence). |
| `POST` | `/api/v1/complaints/{id}/assign` | Authority / Admin | Assign complaint to designated Field Officer with instructions. |
| `POST` | `/api/v1/complaints/{id}/evidence`| Authenticated | Upload photographic evidence (citizen report or resolution proof). |

### 2.5 Spatial Map & Geo-Queries
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/map/clusters` | Public | GeoJSON cluster feed of active complaints within map viewport. |
| `GET` | `/api/v1/map/nearby` | Public | Query complaints within specified radius (in meters) of a coordinate. |

### 2.6 Alerts & Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/alerts` | Public | List active public environmental warnings and advisories. |
| `POST` | `/api/v1/alerts` | Authority / Admin | Broadcast official warning or community alert. |
| `GET` | `/api/v1/notifications` | Authenticated | List user's in-app notifications. |
| `PATCH` | `/api/v1/notifications/{id}/read`| Authenticated | Mark notification as read. |

### 2.7 Analytics & Dashboards
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/analytics/overview` | Authority / Admin | Aggregate complaint metrics, resolution rates, and SLA benchmarks. |
| `GET` | `/api/v1/analytics/category-distribution` | Authority / Admin | Distribution of issues by category and district. |
