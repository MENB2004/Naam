# 03. NAAM (നാം) — GitHub and Repository Architecture Setup

## 1. Remote Repository Details
- **Repository URL:** `https://github.com/MENB2004/Naam.git`
- **Default Branch:** `main`
- **Remote Identifier:** `origin`
- **Initial Commit:** `aaa0c92 Lets Start`
- **Clean Working Tree Status:** Verified.

---

## 2. Branching Strategy
We maintain a strict feature/phase-driven Git branching workflow:

```text
main (Protected, stable production releases)
  └── phase-01-foundation
        └── feat/backend-core
        └── feat/frontend-scaffold
  └── phase-02-design-system
  ...
  └── phase-14-deployment
```

### Branch Naming Conventions:
- `phase-XX-<name>`: Master branch for a specific phase (e.g., `phase-01-foundation`).
- `feat/<feature-name>`: Discrete feature implementations.
- `fix/<issue-name>`: Bug fixes and error recovery.
- `docs/<doc-update>`: Major documentation additions.

---

## 3. Commit Message Conventions
All commits must follow the **Conventional Commits** specification:

```text
<type>(<scope>): <short description in present tense>

[optional body explaining context and rationale]

[optional footer with issue reference]
```

### Allowed Types:
- `feat`: A new feature introduced into the codebase.
- `fix`: A bug fix.
- `docs`: Documentation-only changes.
- `style`: Changes that do not affect code logic (formatting, white-space).
- `refactor`: Code refactoring without behavioral alterations.
- `test`: Adding or updating test suites.
- `chore`: Tooling, build configuration, dependency updates.

---

## 4. Repository Safety & Secret Zero Policy
1. **Never Commit Secrets:** `.env`, `.env.local`, `.env.production`, private keys (`*.pem`, `*.key`), and service account JSON credentials must be explicitly excluded in `.gitignore`.
2. **Never Commit Private Photographs:** Unprocessed citizen photographs containing recognizable human faces or vehicle registration plates without consent must not enter Git version control. Use the `sample-data/field_photos/` structure with sanitized metadata.
3. **No Destructive Operations:** Force pushing (`git push --force`) to `main` is strictly prohibited.
4. **Clean Status Verification:** Always run `git status` and `git diff --cached` before creating any commit.
