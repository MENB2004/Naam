# 16. NAAM (നാം) — Security, Privacy, and Data Governance

## 1. OWASP Top 10 Mitigations
- **A01: Broken Access Control:** Every endpoint checks role claims and entity ownership via FastAPI dependencies. Citizens cannot view internal officer remarks; officers cannot alter complaints outside their jurisdiction.
- **A02: Cryptographic Failures:** Passwords hashed with Argon2id. Tokens signed with secure 256-bit keys. HTTPS enforced in deployment.
- **A03: Injection:** Zero raw SQL queries; all database interactions utilize SQLAlchemy parameterized statements and GeoAlchemy2 spatial functions.
- **A07: Identification and Authentication Failures:** Rate-limiting on `/api/v1/auth/login` (5 attempts per minute per IP), refresh token rotation, and invalidation upon logout.

---

## 2. Privacy & Personal Identifiable Information (PII)
- Citizen phone numbers and emails are never displayed in public map views.
- Public complaint pins display the category, tracking code, description, and sanitized photographs.
- Photos depicting recognizable citizen faces without explicit consent are marked private.
