# PHASE 12: Bilingual Support and Accessibility

## 1. Phase Number
Phase 12

## 2. Phase Title
Bilingual Support and Accessibility

## 3. Objective
Finalize full Malayalam-first localization coverage, English toggle, keyboard navigation, and WCAG 2.1 AA accessibility.

## 4. Scope
Comprehensive JSON locale dictionaries (`src/locales/ml/*.json` and `en/*.json`), persistent language switcher, ARIA attributes, contrast audit.

## 5. Prerequisites
Phase 11 completed.

## 6. Dependencies
i18next, react-i18next, axe-core.

## 7. Detailed Tasks
- [ ] Audit entire frontend codebase to ensure zero hardcoded English strings in UI components
- [ ] Complete translation dictionaries across 6 modules: `common`, `auth`, `community`, `complaints`, `authority`, `admin`
- [ ] Verify Malayalam grammar and natural phrasing with native Kerala environmental terminology
- [ ] Implement persistent Language Switcher in PortalHeader (retaining choice across sessions)
- [ ] Audit keyboard navigation: all buttons, dialogs, and inputs reachable via Tab and Enter
- [ ] Verify WCAG 2.1 AA color contrast compliance across light and dark themes

## 8. Commands to Execute
```powershell
cd frontend
npm run test
```

## 9. Files to Create
- `frontend/src/locales/ml/*.json`
- `frontend/src/locales/en/*.json`
- `frontend/src/components/common/LanguageSwitcher.tsx`

## 10. Existing Files to Modify
- All frontend component files needing translation hook integration

## 11. Database Changes
Store user's preferred language in `users.preferred_language`.

## 12. API Changes
Respect `Accept-Language` header for bilingual API error messages.

## 13. Frontend Changes
Seamless language toggle updating all text elements without page reload.

## 14. Backend Changes
Bilingual error response middleware for API exceptions.

## 15. Security Considerations
Screen reader accessibility: descriptive `aria-label` tags on map markers and icon buttons.

## 16. Testing Requirements
Automated accessibility audit with axe-core; verify zero missing i18n keys.

## 17. Expected Output
App defaults to Malayalam; toggles cleanly to English; passes accessibility audit.

## 18. Acceptance Criteria
100% of UI strings translated; keyboard navigation operates smoothly throughout.

## 19. Verification Commands
```powershell
cd frontend; npm run lint; npm run build
```

## 20. Error Recovery
If a translation key is missing, fall back gracefully to English and log console warning.

## 21. Completion Checklist
- [ ] Zero hardcoded UI strings
- [ ] Complete Malayalam locale files
- [ ] Language switcher tested
- [ ] WCAG AA contrast verified

## 22. User Approval Checkpoint
> [!IMPORTANT]
> Do NOT proceed to the next phase without explicit user approval.
> Once this phase is completed and verified, update permanent documentation and `PROJECT_PROGRESS.md`, then safely delete this file under the temporary phase deletion protocol.
