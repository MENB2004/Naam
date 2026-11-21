# 11. NAAM (നാം) — Frontend Architecture Specification

## 1. Directory Structure

```text
frontend/
├── public/
│   ├── favicon.ico
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root application component
│   │   ├── router.tsx          # React Router v6 route configuration
│   │   └── providers.tsx       # QueryClient, Theme, i18n, Toast providers
│   ├── assets/                 # SVGs, brand illustrations, default images
│   ├── components/
│   │   ├── ui/                 # Accessible shadcn/ui components (Button, Dialog, etc.)
│   │   ├── common/             # StatusBadge, LanguageSwitcher, LoadingSpinner, EmptyState
│   │   ├── layout/             # Navbar, Sidebar, Footer, MobileNav, PortalHeader
│   │   ├── forms/              # Controlled input wrappers with Zod validation
│   │   └── feedback/           # Toast, ErrorBoundary, AlertBanner
│   ├── features/
│   │   ├── auth/               # Login forms, Register, ProtectedRoute guard
│   │   ├── community/          # Citizen dashboard, complaint submission wizard, history
│   │   ├── complaints/         # Shared complaint cards, timeline, detail views
│   │   ├── authorities/        # LSGD triage dashboard, officer assignment modal
│   │   ├── field-officer/      # Mobile-optimized task list, resolution proof uploader
│   │   ├── admin/              # User management, department configuration, audit viewer
│   │   ├── maps/               # Leaflet map container, pin dropper, GeoJSON layers
│   │   ├── alerts/             # Public warning banners, alert broadcast form
│   │   └── analytics/          # Recharts visualizations (resolution rates, category pie)
│   ├── hooks/                  # Custom React hooks (useAuth, useGeolocation, useDebounce)
│   ├── lib/                    # Axios/Fetch client, query client, utility helpers (cn)
│   ├── services/               # API service functions categorized by domain
│   ├── store/                  # Zustand stores (authStore, languageStore, mapStore)
│   ├── locales/                # Bilingual JSON translation dictionaries (ml/ & en/)
│   ├── types/                  # TypeScript interfaces, DTOs, and schema types
│   └── styles/                 # Tailwind CSS styles and font definitions
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 2. Core Frontend Principles
1. **Malayalam-First Localization:** Every user-facing string must be referenced via `t('key')` from `react-i18next`. Default language initializes to `ml`.
2. **Accessible Form Architecture:** Built with `react-hook-form` and `@hookform/resolvers/zod`. All form fields render bilingual validation error messages.
3. **Optimistic Mutations:** When submitting status updates or marking notifications read, the UI updates optimistically with automatic rollback on network failure.
4. **Mobile-First Layouts:** Viewports from 360px up to 4K are styled with mobile ergonomics in mind, including thumb-friendly navigation bars and touch targets ≥ 48px.
