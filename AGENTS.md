# AGENTS.md

Guidance for human and AI contributors working in the **Home Sweet Home — Dashboard** repository.

## Purpose

A single, standalone TV/large-screen dashboard that embeds the **published** widget packages of
the Home Sweet Home modules (`@sousa99/*-components` from GitHub Packages) and launches their
backends from the **published** GHCR images. The dashboard is one app (this repo) — it is not a
module and has no release group coupling.

```text
src/            Vite + React 19 SPA (Tailwind v4, light amber/slate theme)
src/blocks/     one host component per module widget + placeholder/status blocks
src/layout/     the 12-column TV grid (DashboardGrid)
public/config.json  runtime block configuration (stops, location, refresh, placeholders)
deploy/nginx.conf   SPA + /api/<module> reverse proxy (mirrored by the vite dev proxy)
Dockerfile      node:24-slim build (GH Packages secret) → nginx:alpine
docker-compose.yml  GHCR backends + dashboard (./data for the SQLite DBs)
.github/workflows/  ci.yml (gates) + release.yml (publish GHCR image)
```

## Common commands

```bash
pnpm install                                        # requires GitHub Packages access (see setup.md)
pnpm dev                                            # Vite dev server (:5173, proxies to :3100/:3101/:3102)
pnpm build                                          # production SPA build → dist/
pnpm test / pnpm typecheck / pnpm lint / pnpm format
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d   # backends + dashboard
docker compose up -d                                # dashboard on :3304 (HSH_DASHBOARD_PORT)
```

## Conventions & quality gates

- **Identity**: package name `@sousa99/home-sweet-home-dashboard`; scoped deps come from
  `https://npm.pkg.github.com/` (see `.npmrc`, `setup.md`).
- **Quality gates** (enforced on every PR): ESLint, Prettier, typecheck, Vitest, and a Docker
  build. Configs extend `@sousa99/homesweethome-config` — no per-repo config drift.
- **Test-first (non-negotiable)**: behavior changes start with a failing Vitest test, then
  implementation, then a green run.
- **Proxy contract**: widgets are handed a per-module `baseUrl` (`/api/bus`, `/api/tasks`,
  `/api/fly`); the nginx config and the Vite dev proxy strip the `/api/<module>` prefix and
  forward to the module backend. Keep both in sync — changing one without the other breaks either
  the container or `pnpm dev`.
- **TV adaptation**: the grid is rem-based and `overflow: hidden`; do not introduce scrolling
  layouts. Scale text with the root `font-size` clamp in `src/index.css`, never fixed px.
- **Config first**: block behavior lives in `public/config.json` (typed in `src/config.ts` with
  defaults); avoid hardcoding stop ids, coordinates, or refresh rates in components.
- **Commits**: conventional-commit style `type(scope): summary`; pre-commit hook runs lint-staged.

## Agent & skill routing

Delegate by task; the main assistant must not perform git/GitHub operations.

| Task                                            | Delegate to     |
| ----------------------------------------------- | --------------- |
| Commit, push, branches, PRs, issues, CI/Actions | `github-helper` |
| Implementation (test-first)                     | `implementer`   |
| Test suite / coverage verdict                   | `tester`        |
| Pre-merge code review                           | `reviewer`      |
| Final minor-fix polish                          | `nitpicker`     |
| README / setup.md / docs sync                   | `documenter`    |

## Codebase orientation

- `src/config.ts` — typed runtime config, defaults, deep merge (`loadConfig`).
- `src/lib/status.ts` — module health probing (bus /health, tasks reachability, fly feed probe).
- `src/layout/DashboardGrid.tsx` — the TV grid and the per-module `BASE_URLS`.
- `src/blocks/` — `ClockBlock`, `ClosestFlightBlock` + `FlightListBlock` + `FlightMapBlock`
  (the three fly-over widgets split across the grid), `TasksBlock`, `BusBlock`, `StatusBlock`,
  `PlaceholderBlock`.
- `src/layout/DashboardGrid.tsx` — the TV grid (three equal columns: flights closest+list,
  flight map, tasks+bus), the per-module `BASE_URLS`, and the MCP host ports note.
- `opencode.json` — remote MCP entries for the three module servers (`localhost:3200/3201/3202`).
- `deploy/nginx.conf` — SPA serving + `/api/<module>` reverse proxy (compose service names).
- `tests/` — Vitest suite (config merge, status logic, grid shell smoke test).
