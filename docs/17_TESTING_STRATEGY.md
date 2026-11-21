# 17. NAAM (നാം) — Comprehensive Testing Strategy

## 1. Testing Pyramid
```text
          ▲
         /         / E2E \       (Playwright / Manual API Flows)
       /-------      / Integr. \     (Pytest + Async HTTPX + Test DB)
     /-----------    /  Unit Tests \   (Pydantic schemas, password hash, spatial utils)
   /---------------```

---

## 2. Backend Testing Specifications
- **Framework:** `pytest` + `pytest-asyncio` + `httpx`.
- **Database:** Dedicated PostgreSQL test database with PostGIS enabled, automatically rolled back between test sessions.
- **Core Test Suites:**
  - `tests/test_auth.py`: User registration, Argon2id verification, invalid password rejection, JWT expiration, refresh rotation.
  - `tests/test_complaints.py`: Complaint creation, state machine validation, assignment constraints, unauthorized transition blocks.
  - `tests/test_spatial.py`: PostGIS coordinate queries, bounding box queries, boundary enforcement for Kerala.

---

## 3. Frontend Testing Specifications
- **Type Checking:** `npm run type-check` (tsc --noEmit) to ensure zero TypeScript errors.
- **Linting:** `npm run lint` (ESLint) for code cleanliness and accessibility rules.
- **Validation Testing:** Unit tests for form schema validation (Zod) ensuring Malayalam error strings trigger correctly.
