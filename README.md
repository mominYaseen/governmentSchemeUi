# Government Scheme Navigator — Frontend

React + Vite UI for discovering Indian government schemes: **paginated catalog**, **rule-based recommendations** from a structured profile, and **natural-language matching** (backend uses Gemini when configured).

## Prerequisites

- Node.js 18+ recommended
- Backend API running (default dev proxy targets `http://localhost:8080`)

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Recommended for **sign-in**: full API origin **without** a trailing slash (e.g. `http://localhost:8080`) so session and CSRF cookies are set on the Spring host. If unset, requests use relative `/api/...` (Vite dev proxy). |
| `VITE_AUTH_MODE` | Omit or any value except `oauth2` = **demo** login (`POST /api/auth/login`). Set to `oauth2` for **Google** redirect and `/auth/callback`. |

## Scripts

```bash
npm install
npm run dev
```

- **Dev server:** Vite (see terminal for local URL).
- **Production build:** `npm run build` — output in `dist/`.

Optional: `npm run backend` runs the packaged JAR from a sibling repo path; use only if that layout exists on your machine.

## Backend API & OpenAPI

- **Swagger UI:** `{BASE}/swagger-ui/index.html` (e.g. [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html))
- **OpenAPI JSON:** `{BASE}/v3/api-docs` or `{BASE}/v3/api-docs/all`

The UI reads successful payloads from the standard envelope: `response.data` after unwrapping `success` / `error` (implemented in `src/app/api/client.ts`).

**Session (demo auth):** `GET /api/auth/status` (always 200) supplies `data.authenticated` and primes the CSRF cookie. Mutating calls send `X-XSRF-TOKEN` from the `XSRF-TOKEN` cookie. `GET /api/me` returning 401 while anonymous is normal and is not shown as a login error.

## App routes

| Path | Purpose |
|------|---------|
| `/` | Landing + quick “describe” search → `/match` |
| `/catalog` | `GET /api/schemes` — paginated cards; **View summary** loads `GET /api/schemes/{id}` |
| `/recommend` | `POST /api/schemes/recommend` — structured profile form |
| `/match` | `POST /api/schemes/match` — textarea; responses requested in English (`language: en`) |
| `/results?...` | Redirects to `/match` with the same query string (legacy) |
| `/scheme/:id` | Detail view for schemes stored from the last match session |

In **development**, a thin **health** strip calls `GET /api/health` (not shown in production builds).

## Project layout (API-related)

- `src/app/api/client.ts` — fetch wrapper, `ApiResponse` unwrap
- `src/app/api/types.ts` — DTOs aligned with OpenAPI
- `src/app/api/schemes-api.ts` — health, catalog list, scheme detail by id, recommend
- `src/app/api/match-schemes.ts` — natural-language match + mapping to UI `Scheme` model
