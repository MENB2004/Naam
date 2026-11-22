# NAAM application surfaces

The frontend now selects one of two route surfaces while reusing the existing React package, API client, authentication service, FastAPI backend, and database.

## Public surface

- Default build mode: `VITE_APP_SURFACE=public`.
- Public routes include the homepage, map, community sign-in and registration, complaint tracking, and the community dashboard.
- Public navigation contains a single **Official Access** entry; it does not list internal roles.
- `/login` is the community sign-in route. `/login/community` remains as a compatibility alias.
- `/public-map` and `/track-complaint` are aliases for the existing map and tracking pages.

## Official surface

- Portal hosts beginning with `portal.` automatically select official routing. An official build can also set `VITE_APP_SURFACE=official`.
- For local development on the shared host, `/official/*` selects the official surface (for example, `/official/login`).
- `/login` uses one official sign-in form. The backend's returned role determines whether the user can enter the portal and which existing dashboard they reach.
- Authority, Officer, Super Admin, Analytics, and official map routes are only mounted in this surface.
- Registration is redirected to official sign-in; public registration continues to assign the Community role through the existing backend.

Set `VITE_OFFICIAL_PORTAL_URL` in the public build to the official portal URL once the production domain is chosen. Set `VITE_PUBLIC_SITE_URL` in the official build to the public website URL.

This route separation is a frontend and navigation boundary. Backend permission enforcement, session hardening, and data-privacy fixes remain required work in later phases; hiding a route in the public bundle is not an authorization control.
