# Implementation Plan: Add Weather-Psychic Module & Update All Modules

**Branch**: `001-add-weather-psychic` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-add-weather-psychic/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Primary requirement: display live current + hourly weather and a weekly forecast on the TV
dashboard, and bring every existing module to its latest published version.

Technical approach: consume the published `@sousa99/weather-psychic-components@0.1.0` package and
run the published `ghcr.io/sousa99/weather-psychic-backend:0.1.0` image through the same per-module
integration pattern every module uses — a same-origin `/api/weather` proxy (nginx + Vite dev
proxy), compose services (HTTP + MCP), a runtime config section, a host block, and a status probe.
Two widgets (`CurrentWeatherCard` + `DailyForecastCard`) replace the existing "Weather" placeholder.
All existing modules are bumped to their latest published component packages and backend image
tags. **Both `docker-compose.yml` (backend + MCP services, dashboard `depends_on`) and
`opencode.json` (remote MCP entry) gain weather-psychic entries.**

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.3, Vite 6, Node 24 (dashboard build + module
images), pnpm 11.25.

**Primary Dependencies**: new `@sousa99/weather-psychic-components@^0.1.0` (exports
`CurrentWeatherCard`, `DailyForecastCard`, `styles.css`); bumped `@sousa99/bus-catcher-components`
`^0.1.3`, `@sousa99/fly-over-tracker-components` `^0.4.3`, `@sousa99/procrastinator-tracker-components`
`^0.2.0`; `@sousa99/current-time-components` stays `^0.1.1` (already latest).

**Storage**: N/A for the new module — weather-psychic is stateless (keyless Open-Meteo, no
database, no volume). Existing modules keep their `./data` SQLite databases.

**Testing**: Vitest 3 + Testing Library (existing suite in `tests/`). Test-first per constitution:
config merge, status probing, and grid smoke tests updated/added before implementation.

**Target Platform**: TV / large-screen browser SPA (rem-based grid, `overflow: hidden`, no
scrolling layouts); module backends run as Node 24 container images behind nginx.

**Project Type**: Web application (SPA) plus a container deployment stack (`docker-compose.yml`).

**Performance Goals**: Both weather cards render for the configured location within 3s of load;
no scrollbars or cell overflow introduced on the 12-column TV grid.

**Constraints**: Proxy contract MUST stay in sync between `deploy/nginx.conf` and
`vite.config.ts`; weather MCP host port must not collide with existing 3200/3201/3202; dev REST
port must not collide with 3100/3101/3102; runtime behavior config-first in `public/config.json`.

**Scale/Scope**: One dashboard SPA, five module integrations (bus, flights, tasks, clock,
weather), plus the compose/MCP wiring for four backends.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                                                                          | Status | Notes                                                                                     |
| ----------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| I. Dashboard-First: consume published widgets/images only, no module source   | PASS   | Adds published package + published image only; no module code lands here                  |
| II. Local-First & Private: in-home, functional while local backends reachable | PASS   | Weather backend is local; offline `mock` feed keeps it testable without network           |
| III. Declared identity & uniform tooling; no config drift                     | PASS   | Reuses `@sousa99/homesweethome-config` presets; no new tooling added                      |
| IV. Test-First (NON-NEGOTIABLE): failing test → implementation → green        | PASS   | Tasks sequence tests before implementation; suite extended for weather config/status/grid |
| V. Contract & integration tests; nginx ↔ vite proxy sync                      | PASS   | Both proxies updated in the same slice; smoke test + grid test cover weather              |
| VI. Independent per-module version pins; `docs/versions.md` updated           | PASS   | Version bumps are per-module and documented                                               |

## Project Structure

### Documentation (this feature)

```text
specs/001-add-weather-psychic/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── weather-api.md   # REST routes + proxy mapping + MCP server contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Single-project SPA + compose stack (existing structure, this feature's touchpoints)
src/
├── main.tsx                 # + import '@sousa99/weather-psychic-components/styles.css'
├── config.ts                # + WeatherConfig + DEFAULT_CONFIG.weather + WeatherLocation type
├── blocks/
│   └── WeatherBlock.tsx     # NEW — hosts CurrentWeatherCard + DailyForecastCard
├── layout/
│   └── DashboardGrid.tsx    # weather section replaces the "Weather" placeholder; BASE_URLS.weather
└── lib/
    └── status.ts            # + 'weather' module key, label, probe path

public/
└── config.json              # + weather.location / refetch config; Weather placeholder removed

deploy/
└── nginx.conf               # + location /api/weather/ -> weather-psychic-backend:3000

vite.config.ts               # + /api/weather dev proxy -> localhost:3103

docker-compose.yml           # + weather-psychic-backend + weather-psychic-mcp services,
                             #   dashboard depends_on + weather; backend version bump envs
docker-compose.dev.yml       # + weather-psychic-backend ports 3103:3000
opencode.json                # + "weather-psychic" remote MCP entry (http://localhost:3203/mcp)
.env.example                 # + HSH_WEATHER_PSYCHIC_BACKEND_VERSION, HSH_WEATHER_PSYCHIC_MCP_PORT
package.json                 # + weather-psychic-components dep; bumped module deps
docs/versions.md             # + weather-psychic row; updated pins for bus/fly/tasks
tests/
├── config.test.ts           # + weather config merge cases
├── status.test.ts           # + weather probe cases
└── dashboard.test.tsx       # mock weather components; status mock + weather; placeholder count
```

**Structure Decision**: Keep the existing single SPA at the repository root (`src/`) and the
root-level deployment files. Weather follows the identical integration pattern already used by
bus/fly/tasks — no new directories, no new projects. Version updates touch `package.json`,
`docker-compose.yml`, and `.env.example` only.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — the Complexity Tracking table is intentionally empty.

## Phase 0 — Research (see `research.md`)

Resolved all unknowns: weather-psychic package/image versions and exports, widget prop
contracts, backend REST + MCP surface, proxy/base-url behavior, compose + dev proxy + opencode
wiring, and the exact latest published versions for the existing modules. No
`NEEDS CLARIFICATION` items remain.

## Phase 1 — Design (see `data-model.md`, `contracts/`, `quickstart.md`)

- `data-model.md` — WeatherLocation, WeatherConfig, and the forecast payload entities.
- `contracts/weather-api.md` — REST endpoints, proxy rewrite mapping, MCP server + tools.
- `quickstart.md` — end-to-end validation guide.

### Constitution Check (post-Phase 1 re-evaluation)

All gates remain PASS. The design only adds a fourth module using the established pattern; the
proxy contract is kept in sync on both sides (nginx + Vite), the module is consumed from
published packages/images only, version pins stay per-module, and the plan sequences
test-first work in `tasks.md`.
