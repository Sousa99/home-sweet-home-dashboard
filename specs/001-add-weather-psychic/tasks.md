---
description: 'Task list template for feature implementation'
---

# Tasks: Add Weather-Psychic Module & Update All Modules

**Input**: Design documents from `specs/001-add-weather-psychic/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included for every user story because the project constitution mandates
**Test-First (NON-NEGOTIABLE)**: behavior changes start with a failing Vitest test, then
implementation, then a green run.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- This feature touches the existing single SPA plus root-level deployment files.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Add `@sousa99/weather-psychic-components` `^0.1.0` to `dependencies` in package.json, then run `pnpm install` so the new module package is resolved from GitHub Packages
- [x] T002 Import `@sousa99/weather-psychic-components/styles.css` in src/main.tsx (place it after the `current-time-components` styles import, before `./index.css`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `WeatherLocation` type (`id`, `name`, `latitude`, `longitude`, `timezone`, optional `country`/`admin1`) and `WeatherConfig` interface (`location`, `refetchIntervalMs`, `maxDays`) with a Lisbon-area `DEFAULT_CONFIG.weather` in src/config.ts
- [x] T004 Add a `weather` block (`location`, `refetchIntervalMs`, `maxDays`) to public/config.json and remove the `"Weather"` placeholder entry from the `placeholders` array
- [x] T005 Add `weather: '/api/weather'` to the `BASE_URLS` map in src/layout/DashboardGrid.tsx
- [x] T006 Add `location /api/weather/` reverse proxy forwarding (with `/api/weather` prefix rewrite) to `weather-psychic-backend:3000` in deploy/nginx.conf
- [x] T007 Add `/api/weather` dev proxy (rewrite strips the prefix) targeting `http://localhost:3103` in vite.config.ts
- [x] T008 Add `weather-psychic-backend` (image `ghcr.io/sousa99/weather-psychic-backend:${HSH_WEATHER_PSYCHIC_BACKEND_VERSION:-0.1.0}`, `--http`, no volume, healthcheck on `/api/health`) and `weather-psychic-mcp` (image same, `--mcp`, host port `3203:3001`) services to docker-compose.yml, and add `weather-psychic-backend: condition: service_healthy` to the dashboard `depends_on`
- [x] T009 Add `weather-psychic-backend` ports `3103:3000` to docker-compose.dev.yml
- [x] T010 Add `HSH_WEATHER_PSYCHIC_BACKEND_VERSION=0.1.0` and `HSH_WEATHER_PSYCHIC_MCP_PORT=3203` to .env.example
- [x] T011 Add a `weather-psychic` remote MCP entry (`{ "type": "remote", "url": "http://localhost:3203/mcp", "enabled": true }`) to opencode.json

**Checkpoint**: Foundation ready — the `/api/weather` proxy, compose services, config types, and
`public/config.json` weather block exist; user story implementation can now begin.

---

## Phase 3: User Story 1 - View Current & Hourly Weather (Priority: P1) 🎯 MVP

**Goal**: The dashboard shows the current conditions (temperature, condition, feels-like, humidity,
wind, precipitation probability, UV) for the configured location with an auto-scrolling hourly strip.

**Independent Test**: Render the dashboard with a configured weather location and confirm the
current-conditions widget appears and fetches real values through `/api/weather`.

### Tests for User Story 1 (MANDATORY — constitution requires test-first) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US1] Add weather config tests in tests/config.test.ts: `DEFAULT_CONFIG.weather` deep-merges overrides, keeps defaults for missing fields, and falls back to defaults on invalid input
- [x] T013 [P] [US1] Update tests/dashboard.test.tsx: mock `@sousa99/weather-psychic-components` (`CurrentWeatherCard` + `DailyForecastCard` render testids), assert the current-weather card renders in the weather section, and change the placeholder assertion from 3 to 2 ("Coming soon")

### Implementation for User Story 1

- [x] T014 [US1] Create WeatherBlock in src/blocks/WeatherBlock.tsx hosting `CurrentWeatherCard` with `location={config.weather.location}`, `baseUrl={BASE_URLS.weather}`, `refetchIntervalMs={config.weather.refetchIntervalMs}`, `className` for the grid cell
- [x] T015 [US1] Replace the "Weather" placeholder region with a weather section rendering `WeatherBlock` (icon + "Weather" heading) in src/layout/DashboardGrid.tsx

**Checkpoint**: User Story 1 is fully functional — current + hourly weather renders with live data.

---

## Phase 4: User Story 2 - View the Weekly Weather Forecast (Priority: P1)

**Goal**: The dashboard shows the upcoming days (starting tomorrow) as day / condition / low-high
in the same weather section.

**Independent Test**: Confirm the weekly forecast widget lists the upcoming days for the configured
location alongside the current-conditions card.

### Tests for User Story 2 (MANDATORY — constitution requires test-first) ⚠️

> **NOTE: Write this test FIRST, ensure it FAILS before implementation**

- [x] T016 [P] [US2] Extend tests/dashboard.test.tsx to assert the `DailyForecastCard` testid renders in the weather section

### Implementation for User Story 2

- [x] T017 [US2] Add `DailyForecastCard` to src/blocks/WeatherBlock.tsx with `location={config.weather.location}`, `baseUrl={BASE_URLS.weather}`, `maxDays={config.weather.maxDays}`, `className`

**Checkpoint**: User Stories 1 AND 2 both work — the weather section shows current + hourly and weekly forecast.

---

## Phase 5: User Story 3 - Dashboard Runs on the Latest Module Versions (Priority: P2)

**Goal**: Bus, flights, tasks (and weather) run on their latest published component packages and
backend image tags; no existing block regresses.

**Independent Test**: Verify `package.json` pins and `.env.example`/`docker-compose.yml` tags match
the latest published versions, and the existing dashboard grid test still passes (all existing
blocks render).

- [x] T018 [P] [US3] Bump component pins in package.json: `@sousa99/bus-catcher-components` to `^0.1.3`, `@sousa99/fly-over-tracker-components` to `^0.4.3`, `@sousa99/procrastinator-tracker-components` to `^0.2.0`, then run `pnpm install`
- [x] T019 [US3] Bump backend image tags in .env.example AND the compose defaults in docker-compose.yml: `HSH_BUS_CATCHER_BACKEND_VERSION=0.1.3`, `HSH_FLY_OVER_TRACKER_BACKEND_VERSION=0.4.3`, `HSH_PROCRASTINATOR_TRACKER_BACKEND_VERSION=0.2.0`
- [x] T020 [P] [US3] Update docs/versions.md: bump the bus/fly/tasks pins in the "Current pins" table and add a weather-psychic row (`@sousa99/weather-psychic-components` `^0.1.0` / `weather-psychic-backend` `0.1.0`)

**Checkpoint**: All modules pinned to latest published versions; existing grid test still green.

---

## Phase 6: User Story 4 - Weather Module Health on the Status Panel (Priority: P2)

**Goal**: The status panel lists Weather and reports its reachability via the `/api/weather` health probe.

**Independent Test**: Stop the weather backend and confirm the status panel shows Weather offline
while the rest of the dashboard stays functional.

### Tests for User Story 4 (MANDATORY — constitution requires test-first) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US4] Add weather probe tests in tests/status.test.ts: `checkModule('weather')` up on 2xx-4xx and down on 5xx/timeout, probes `/api/weather/api/health`, and `checkAllModules` returns `['bus', 'tasks', 'fly', 'weather']`
- [x] T022 [P] [US4] Update tests/dashboard.test.tsx status mock to include a weather entry and assert the status footer renders "Weather"

### Implementation for User Story 4

- [x] T023 [US4] Add `'weather'` to `ModuleKey`, `MODULE_KEYS`, `LABELS` ("Weather"), and `PROBE_PATHS` (`/api/weather/api/health`) in src/lib/status.ts

**Checkpoint**: All four user stories independently functional; status panel reflects weather health.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Update README.md: add the Weather row to the module table, add `/api/weather` to the proxy list, and add `weather-psychic` → `http://localhost:3203/mcp` to the MCP table
- [x] T025 [P] Update setup.md: note the weather backend is stateless (no volume), add the weather dev port to the `:3100/:3101/:3102` line (`:3103`), and mention `HSH_WEATHER_PSYCHIC_*` env vars
- [x] T026 Run the quickstart.md end-to-end validation: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`, verify `:3103/api/health`, MCP at `:3203`, prod nginx proxy at `:3304/api/weather/api/health`, then the resilience check (stop `weather-psychic-backend` → status shows Weather down, dashboard alive)
- [x] T027 Run the final quality gates: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test` — all must pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Phase 3) and US2 (Phase 4) are both P1; US2 builds on the WeatherBlock created in US1
  - US3 (Phase 5) and US4 (Phase 6) are P2 and independent of US1/US2 file-wise after Foundational
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 (extends `src/blocks/WeatherBlock.tsx` and the grid test)
- **User Story 3 (P2)**: Can start after Foundational — No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational — No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Config/type work before host components
- Host block before grid integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational completes: US1, US3, and US4 can start in parallel (US2 waits on US1)
- All tests for a user story marked [P] can run in parallel
- US3's `package.json`/`.env.example`/`docs/versions.md` edits are all [P]
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Add weather config tests in tests/config.test.ts (T012)"
Task: "Update tests/dashboard.test.tsx weather mocks + assertions (T013)"

# Launch config + proxy foundation in parallel (Phase 2):
Task: "Add WeatherConfig types in src/config.ts (T003)"
Task: "Add /api/weather nginx proxy in deploy/nginx.conf (T006)"
Task: "Add /api/weather dev proxy in vite.config.ts (T007)"
Task: "Add weather compose services in docker-compose.yml (T008)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup (weather dependency + styles)
2. Complete Phase 2: Foundational (config, proxy, compose, MCP wiring — CRITICAL)
3. Complete Phase 3: User Story 1 → current + hourly weather renders
4. **STOP and VALIDATE**: Test User Story 1 independently (dashboard shows live current + hourly)
5. Because US2 is also P1 and requested explicitly, land it immediately after (Phase 4) to deliver
   the complete weather section (current + hourly + weekly)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (weather backend reachable via `/api/weather`)
2. Add User Story 1 → Test independently → Demo (MVP: current + hourly weather)
3. Add User Story 2 → Test independently → Demo (weekly forecast added)
4. Add User Story 3 → Verify no regressions (all modules on latest pins)
5. Add User Story 4 → Status panel shows weather health
6. Polish → docs, quickstart validation, full quality gates

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 → then User Story 2 (shares WeatherBlock)
   - Developer B: User Story 3 (version bumps — disjoint files)
   - Developer C: User Story 4 (status probe — disjoint files)
3. Stories complete and integrate independently; `tests/dashboard.test.tsx` is edited
   sequentially (US1 → US2 → US4) to avoid same-file conflicts

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (constitution: Test-First NON-NEGOTIABLE)
- Commit after each task or logical group (conventional-commit style, via github-helper)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same-file parallel conflicts, cross-story dependencies that break independence
- The weather backend is stateless: no migration task, no volume — unlike procrastinator-tracker
