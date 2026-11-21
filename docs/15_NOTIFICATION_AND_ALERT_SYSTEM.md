# 15. NAAM (നാം) — Notification and Alert System

## 1. Notification Classification
1. **Personal In-App Notifications:**
   - Complaint submitted acknowledgement.
   - Assignment notification to Field Officer.
   - Status update alerts to Citizen (e.g. "Work in progress by Haritha Karma Sena").
   - Resolution notification requesting citizen verification.
2. **Public Environmental Alerts:**
   - Official alerts from Kerala Disaster Management (SDMA), KSPCB, or LSGDs.
   - Categorized by level: `INFO`, `WARNING`, `CRITICAL`.
   - Distinguishes official alerts from community notices and simulation data.

---

## 2. Data Categorization Standards
| Alert Source Tag | Visual Badge | Verification Level | Purpose |
|---|---|---|---|
| `OFFICIAL_WARNING` | Red / Amber Shield | Verified Government Source | Disasters, water contamination notices, official bans. |
| `COMMUNITY_REPORT` | Blue Flag | Citizen-reported, Unverified | Public advisory regarding active clean-up drives or local hazards. |
| `SIMULATED_DEMO_ALERT`| Purple Outline | Demo / Test Record | Clearly labeled demonstration alerts for evaluation. |
