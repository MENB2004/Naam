# 21. NAAM (നാം) — Definition of Done (DoD)

## 1. Phase Completion Criteria
A phase is considered **Done** if and only if all of the following conditions are met:
1. **Implementation Complete:** All tasks outlined in the phase execution plan have been implemented without mock placeholders in core logic.
2. **Automated Verification:** All unit tests, API tests, and type checks associated with the phase pass without errors.
3. **Documentation Updated:** Permanent architecture and design documents reflect all implementation decisions.
4. **Project Progress Updated:** `docs/PROJECT_PROGRESS.md` is updated with completed tasks, test results, and next recommendations.
5. **Architectural Decisions Logged:** Any deviation or technical decision is recorded in `docs/PROJECT_DECISIONS.md`.
6. **User Approval Granted:** The user has reviewed the phase summary and explicitly authorized proceeding.
7. **Temporary Phase File Removed:** Only after verified user approval is the temporary `PHASE_XX_*.md` file safely deleted.
