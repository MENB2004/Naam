# 23. NAAM (നാം) — User Decisions and Changelog (ADR)

## Architectural Decision Records (ADR)

### ADR-01: Modular Monolithic Architecture
- **Date:** 2026-11-21
- **Status:** Approved
- **Context:** Deciding between microservices and modular monolith for NAAM MVP.
- **Decision:** Modular Monolith using FastAPI and React + Vite.
- **Rationale:** Ensures maximum development speed, zero network latency between internal services, simplified database transactions, and easy containerized deployment.

### ADR-02: Malayalam-First Localization Architecture
- **Date:** 2026-11-21
- **Status:** Approved
- **Context:** Providing natural accessibility to citizens of Kerala.
- **Decision:** Use native JSON dictionary files with `react-i18next`. Default language is Malayalam (`ml`), with English (`en`) as an accessible secondary option.
- **Rationale:** External translation APIs (Google Translate) produce robotic, bureaucratic Malayalam that alienates grassroots users.
