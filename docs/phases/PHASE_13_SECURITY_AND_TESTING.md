# PHASE 13: Security, Testing and Integration

## 1. Phase Number
Phase 13

## 2. Phase Title
Security, Testing and Integration

## 3. Objective
Perform end-to-end integration testing, security hardening, rate limiting, and OWASP Top 10 validation.

## 4. Scope
Full Pytest suite, API integration test flows, SlowAPI rate limiting, security header middleware, input sanitization.

## 5. Prerequisites
Phase 12 completed.

## 6. Dependencies
Pytest, HTTPX, SlowAPI, Ruff.

## 7. Detailed Tasks
- [ ] Implement rate limiting on authentication and complaint submission routes using SlowAPI
- [ ] Configure HTTP security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
- [ ] Write end-to-end user journey tests (Citizen Report -> Authority Triage -> Officer Resolve -> Citizen Verify)
- [ ] Conduct automated security scan: SQL injection tests, XSS payload submissions, unauthorized IDOR tests
- [ ] Run Ruff linter and formatter across entire backend codebase
- [ ] Run TypeScript type check and ESLint across entire frontend codebase

## 8. Commands to Execute
```powershell
cd backend
uv run ruff check .
uv run pytest
cd ..\frontend
npm run type-check
npm run lint
```

## 9. Files to Create
- `backend/tests/test_e2e_journey.py`
- `backend/app/middleware/security_headers.py`

## 10. Existing Files to Modify
- `backend/app/main.py`
- `frontend/package.json`

## 11. Database Changes
None in Phase 13.

## 12. API Changes
Rate limiting headers (`X-RateLimit-*`) added to API responses.

## 13. Frontend Changes
Display user-friendly error messages when rate limit is exceeded.

## 14. Backend Changes
Rate limiting middleware, security headers middleware.

## 15. Security Considerations
Verify no plain-text credentials exist; verify all database queries use parameterized inputs.

## 16. Testing Requirements
100% passing automated test suite covering unit, integration, and security scenarios.

## 17. Expected Output
Clean test run with 0 errors, 0 security vulnerabilities identified, and clean linting reports.

## 18. Acceptance Criteria
All Pytest suites pass; frontend type check passes; security tests pass.

## 19. Verification Commands
```powershell
cd backend; uv run pytest; cd ..\frontend; npm run build
```

## 20. Error Recovery
If any test fails, isolate root cause, apply targeted fix, and re-run entire regression suite.

## 21. Completion Checklist
- [ ] Rate limiting active
- [ ] Security headers enabled
- [ ] E2E integration test passing
- [ ] Ruff and TypeScript checks passing

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
