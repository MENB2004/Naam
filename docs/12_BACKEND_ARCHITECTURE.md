# 12. NAAM (നാം) — Backend Architecture Specification

## 1. Clean Modular Structure

```text
backend/
├── app/
│   ├── main.py                 # FastAPI application factory & lifespan handler
│   ├── core/
│   │   ├── config.py           # Pydantic BaseSettings configuration (DB, JWT, CORS)
│   │   ├── security.py         # Argon2id hashing, JWT encoding/decoding
│   │   ├── database.py         # Async SQLAlchemy engine, session maker, base model
│   │   └── logging.py          # Structured JSON logging configuration
│   ├── api/
│   │   ├── v1/
│   │   │   ├── api.py          # Master v1 APIRouter aggregator
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── departments.py
│   │   │   │   ├── complaints.py
│   │   │   │   ├── assignments.py
│   │   │   │   ├── evidence.py
│   │   │   │   ├── maps.py
│   │   │   │   ├── alerts.py
│   │   │   │   ├── notifications.py
│   │   │   │   └── analytics.py
│   │   │   └── deps.py         # Dependency injection (get_db, get_current_user)
│   ├── models/                 # SQLAlchemy 2.0 ORM entity models
│   ├── schemas/                # Pydantic v2 request/response validation schemas
│   ├── services/               # Business logic & state machine transitions
│   ├── repositories/           # Database CRUD & spatial PostGIS queries
│   ├── permissions/            # RBAC guards & role permission checking logic
│   ├── middleware/             # CORS, Security Headers, Rate Limiting, Request ID
│   └── utils/                  # Coordinate validation, file handlers, formatting
├── migrations/                 # Alembic environment and migration versions
├── tests/
│   ├── conftest.py             # Pytest fixtures, test database setup
│   ├── test_auth.py            # Auth & RBAC test suite
│   ├── test_complaints.py      # Complaint lifecycle & state machine tests
│   └── test_maps.py            # Spatial query & bounding box tests
├── pyproject.toml              # Project dependencies managed via uv / pip
└── alembic.ini
```

---

## 2. Dependency Injection & Service Layer Separation
To ensure testability and prevent coupling:
- **Endpoints** only validate request syntax and deserialize inputs via Pydantic.
- **Services** encapsulate the business rules (e.g. "Only an assigned officer can upload resolution proof").
- **Repositories** execute SQL queries using SQLAlchemy and GeoAlchemy2.
- **Dependencies (`deps.py`)** supply async database sessions and verified user claims.
