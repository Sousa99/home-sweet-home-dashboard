---
description: 'Task list for the neo-brutalist light/dark identity refresh'
---

# Tasks: Dashboard Visual Identity Refresh (Light & Dark)

**Input**: Design documents from `specs/003-dashboard-theme-refresh/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: REQUIRED. The project constitution mandates test-first, so every behavior change starts
with a failing test before implementation.

**Organization**: Tasks are grouped by user story. Tests precede implementation within each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: `[US1]`–`[US4]`, mapped to `spec.md`
- Every task includes an exact file or directory path

## Path Conventions

- Unprefixed paths (`src/`, `tests/`, `index.html`) are in **this dashboard repo**.
- Paths beginning with `../home-sweet-home-modules/` are in the **sibling modules checkout**.
- Module frontends are `../home-sweet-home-modules/modules/<module>/frontend/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm both checkouts and tooling before cross-repo work.

- [x] T001 Verify the sibling modules checkout exists and install both workspaces: run `pnpm install` in this repo and in `../home-sweet-home-modules/` (see `package.json` in each).
- [x] T002 [P] Confirm Node 24/pnpm 11.25 and GitHub Packages access for `@sousa99/*`; validate `.npmrc` and `setup.md` so the new theme package will resolve.
- [x] T003 [P] Install the Playwright browser used by `playwright.config.ts`: `pnpm exec playwright install chromium`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared token package, runtime appearance plumbing, and mechanical guards. No user story
can be completed until this phase is green.

**⚠️ CRITICAL**: Phase 3+ depends on this phase.

- [x] T004 Create the theme package skeleton in `../home-sweet-home-modules/packages/theme/` (`package.json` with `./theme.css` + `./tokens` exports and `publishConfig`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`).
- [x] T005 [P] Write failing contract tests in `../home-sweet-home-modules/packages/theme/src/theme.test.ts`: every token exists in both appearances, one accent per appearance, and all contrast pairs in `contracts/theme-tokens.md` pass (4.5:1 text, 3:1 UI).
- [x] T006 Implement `../home-sweet-home-modules/packages/theme/src/theme.css` with `:root`/`[data-theme='light']`/`[data-theme='dark']` token values, `@theme inline` mappings, and the `.hsh-*` primitives from `contracts/theme-tokens.md`; make T005 pass.
- [x] T007 [P] Export typed token names/values from `../home-sweet-home-modules/packages/theme/src/tokens.ts` and re-export from `src/index.ts`.
- [x] T008 [P] Create the modules palette guard `../home-sweet-home-modules/scripts/check-theme-tokens.mjs` that fails on raw palette utilities/hex literals per `contracts/widget-theme-consumption.md` (allowlist semantic circular status dots only).
- [x] T009 [P] Wire the guard into `../home-sweet-home-modules/package.json` scripts and `../home-sweet-home-modules/.github/workflows/ci.yml`.
- [x] T010 [P] Create the dashboard palette guard test `tests/theme/palette-guard.test.ts` covering `src/**/*.tsx`.
- [x] T011 [P] Add `@sousa99/homesweethome-theme` to each module frontend and import it after Tailwind in `../home-sweet-home-modules/modules/{bus-catcher,current-time,fly-over-tracker,procrastinator-tracker,weather-psychic}/frontend/src/index.css`; remove their per-package `--color-primary` blocks.
- [x] T012 [P] Add `@sousa99/homesweethome-theme` to this repo's `package.json` and import `@sousa99/homesweethome-theme/theme.css` in `src/index.css` after `@import 'tailwindcss'` (this file is loaded last by `src/main.tsx`, after widget styles).
- [x] T013 [P] Write failing core resolution tests in `tests/theme/useTheme.test.tsx` (System → resolved light/dark, invalid value → System, `data-theme` sync, media change while System).
- [x] T014 Implement the core `src/theme/useTheme.ts` resolution + `<html data-theme>` sync and mount it from `src/App.tsx`; make T013 pass.
- [x] T015 [P] Add the initial theme package changeset in `../home-sweet-home-modules/.changeset/dashboard-theme-refresh.md` (theme `0.1.0`, widget minors).

**Checkpoint**: Tokens compile in all packages, guards exist (and currently fail on legacy classes), and the appearance resolver is tested.

---

## Phase 3: User Story 1 — Refreshed Light Appearance (Priority: P1) 🎯 MVP

**Goal**: Replace the warm amber/slate light look with the approved neo-brutalist light identity across
the dashboard shell and every widget.

**Independent Test**: Load the dashboard with light appearance at 1920×1080: every block and widget
uses the light tokens (off-white/ink, orange accent, square corners, thick outlines, hard shadows),
with zero legacy amber/slate styling; `tests/e2e/theme-light.spec.ts` and both palette guards pass.

### Tests for User Story 1

- [x] T016 [P] [US1] Write failing `tests/e2e/theme-light.spec.ts`: `data-theme="light"`, computed page/surface/ink/accent token values, zero legacy amber/slate colors, and no horizontal overflow at TV/phone.

### Implementation for User Story 1

- [x] T017 [P] [US1] Refactor `../home-sweet-home-modules/packages/components/src/WidgetStatusBar.tsx` to semantic tokens (flat surface, thick outline, hard shadow, accent only where required).
- [x] T018 [P] [US1] Refactor `../home-sweet-home-modules/modules/current-time/frontend/src/{components,pages}/**/*.tsx` to semantic tokens; display numerals with tabular figures and accent only on the active format.
- [x] T019 [P] [US1] Refactor `../home-sweet-home-modules/modules/bus-catcher/frontend/src/{components,pages}/**/*.tsx` to semantic tokens; flatten stop cards, departures, line badges, and relative times.
- [x] T020 [P] [US1] Refactor `../home-sweet-home-modules/modules/weather-psychic/frontend/src/{components,pages}/**/*.tsx` to semantic tokens; flatten current/hourly/daily surfaces and restrict condition art to ink/accent.
- [x] T021 [P] [US1] Refactor `../home-sweet-home-modules/modules/fly-over-tracker/frontend/src/{components,pages}/**/*.tsx` to semantic tokens; flatten closest panel, list, map card, and controls (dark basemap deferred to US2).
- [x] T022 [P] [US1] Refactor `../home-sweet-home-modules/modules/procrastinator-tracker/frontend/src/{components,pages}/**/*.tsx` to semantic tokens; flatten task cards/filters and map urgency to status tokens.
- [x] T023 [P] [US1] Restyle the dashboard shell and body in `src/index.css`: replace hardcoded `#fffbeb`/`#0f172a`, amber/slate classes, and phone-header colors with semantic token utilities; keep layout unchanged.
- [x] T024 [P] [US1] Restyle `src/App.tsx` (loading shell), `src/layout/DashboardGrid.tsx` (headings), and `src/blocks/PlaceholderBlock.tsx` to semantic tokens.
- [x] T025 [P] [US1] Restyle `src/blocks/WeatherBlock.tsx`, `src/blocks/StatusBlock.tsx`, and `src/components/DateReadout.tsx` to semantic tokens, including status colors and focus states.
- [x] T026 [US1] Run `node scripts/check-theme-tokens.mjs` in `../home-sweet-home-modules` and `pnpm exec vitest run tests/theme/palette-guard.test.ts` here; remove every remaining legacy palette/gradient/soft-shadow/rounded class in the touched sources.
- [x] T027 [US1] Build each widget package (`pnpm -r build:lib` in `../home-sweet-home-modules`) and inspect every Storybook story in light mode; fix any flat-surface or contrast regressions.
- [x] T028 [US1] Run `pnpm exec playwright test tests/e2e/theme-light.spec.ts tests/e2e/responsive.spec.ts` and fix light-appearance or layout regressions.

**Checkpoint**: The light identity is complete and independently demonstrable; the dashboard still follows the OS appearance for now.

---

## Phase 4: User Story 2 — First-Class Dark Appearance (Priority: P1)

**Goal**: Make the dark appearance genuinely dark, legible, and complete, including a themed map
basemap and widget-specific dark fixes.

**Independent Test**: With `prefers-color-scheme: dark` emulated, every surface is near-black, text
and status colors are readable, no white panels remain, and the map requests the dark basemap;
`tests/e2e/theme-dark.spec.ts` and the contrast tests pass.

### Tests for User Story 2

- [x] T029 [P] [US2] Write failing `tests/e2e/theme-dark.spec.ts`: dark tokens on page/surfaces, zero near-white panels, readable status text, dark map tile host, and no overflow at TV/phone.
- [x] T030 [P] [US2] Write failing prop tests in `../home-sweet-home-modules/modules/fly-over-tracker/frontend/src/components/FlyOverMapCard.test.tsx` and `AircraftMapView.test.tsx` for `tileUrl` + `tileAttribution` forwarding and the default OSM attribution.

### Implementation for User Story 2

- [x] T031 [US2] Add the optional `tileAttribution` prop and tokenized map overlay colors in `../home-sweet-home-modules/modules/fly-over-tracker/frontend/src/components/{FlyOverMapCard,AircraftMapView,FlyOverMap}.tsx`; make T030 pass.
- [x] T032 [P] [US2] Add `flights.tileLayers` (`light`/`dark` `{ url, attribution }`) to `src/config.ts` and document it in `public/config.json` with OSM light and Esri World Dark Gray dark defaults.
- [x] T033 [P] [US2] Select the active tile layer from the resolved appearance in `src/blocks/FlightMapBlock.tsx` and pass `tileUrl`/`tileAttribution` to `FlyOverMapCard`.
- [x] T034 [US2] Apply dark-specific fixes in `../home-sweet-home-modules/modules/fly-over-tracker/frontend/src/components/` (Leaflet controls/attribution, marker/circle contrast) and `../home-sweet-home-modules/modules/weather-psychic/frontend/src/components/` (weather art/contrast).
- [x] T035 [US2] Run `pnpm exec vitest run tests/theme/tokens.test.ts` and `pnpm exec playwright test tests/e2e/theme-dark.spec.ts`, then fix every contrast/legibility failure.
- [x] T036 [US2] Inspect all five module Storybook stories in dark mode via `../home-sweet-home-modules/modules/*/frontend/.storybook/preview.ts` and fix any light-theme remnants in the component sources.

**Checkpoint**: Dark appearance is fully usable independently of the manual control.

---

## Phase 5: User Story 3 — One Visual Language Across All Modules (Priority: P1)

**Goal**: Prove and enforce that all blocks share one palette, outline, shadow, type, and spacing
language in both appearances.

**Independent Test**: A consistency e2e spec and both palette guards pass in both appearances; a
reviewer sees no block that looks like it belongs to a different product.

### Tests for User Story 3

- [x] T037 [P] [US3] Write failing `tests/e2e/theme-consistency.spec.ts`: every `[data-block]` shares radius 0, the same border width, the same hard-shadow offset, at most one accent color, and no gradients/soft shadows in both appearances.

### Implementation for User Story 3

- [x] T038 [P] [US3] Add a theme toolbar/decorator to `../home-sweet-home-modules/modules/{bus-catcher,current-time,fly-over-tracker,procrastinator-tracker,weather-psychic}/frontend/.storybook/preview.ts` so every story can be reviewed in light/dark.
- [x] T039 [US3] Extract any pattern repeated across three or more widgets into `.hsh-*` primitives in `../home-sweet-home-modules/packages/theme/src/theme.css`, then update the consuming components.
- [x] T040 [US3] Run the modules palette guard, `pnpm test`, and `pnpm -r build:lib` in `../home-sweet-home-modules`; fix every violation until both guards report zero.
- [x] T041 [US3] Run `pnpm exec playwright test tests/e2e/theme-consistency.spec.ts` across phone/tablet/TV and fix inconsistencies.
- [x] T042 [US3] Document the token and widget-consumption rules in `../home-sweet-home-modules/docs/theme.md` (link the dashboard contracts).

**Checkpoint**: Visual consistency is mechanically enforced, not just eyeballed.

---

## Phase 6: User Story 4 — Choosing and Keeping an Appearance (Priority: P2)

**Goal**: Follow the device preference by default, allow a remembered manual override, and never
flash the wrong theme.

**Independent Test**: Toggle System/Light/Dark, reload, change the emulated OS preference, and open a
second tab: the chosen appearance persists and applies immediately with no flash;
`tests/theme/useTheme.test.tsx` and `tests/e2e/theme-preference.spec.ts` pass.

### Tests for User Story 4

- [x] T043 [P] [US4] Extend `tests/theme/useTheme.test.tsx` with failing storage, System-return, cross-tab `storage` event, and media-listener attach/detach cases from `contracts/theme-preference.md`.
- [x] T044 [P] [US4] Write failing `tests/e2e/theme-preference.spec.ts`: manual light/dark persists across reload, System clears the key and follows emulated media, control state matches appearance, and the first painted background matches `data-theme`.

### Implementation for User Story 4

- [x] T045 [US4] Extend `src/theme/useTheme.ts` with the `hsh.dashboard.theme` storage contract, System/Light/Dark preference, media listener lifecycle, and `storage` event sync; make T043 pass.
- [x] T046 [P] [US4] Create `src/theme/ThemeControl.tsx` (three accessible options, `aria-pressed`, Monitor/Sun/Moon icons, 44px targets, icon-only on phone).
- [x] T047 [US4] Wire `ThemeControl` into the header in `src/layout/DashboardGrid.tsx`, including the phone header, without changing TV layout height.
- [x] T048 [US4] Add the inline boot script and critical background style to `index.html` per `contracts/theme-preference.md` (try/catch storage, system fallback, no flash).
- [x] T049 [US4] Run `tests/theme/useTheme.test.tsx` and `tests/e2e/theme-preference.spec.ts`; fix persistence, flash, or accessibility failures.

**Checkpoint**: Appearance choice is complete and independent of the visual refactors.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T050 [P] Update `docs/versions.md` with the new theme/widget versions and pinning notes.
- [x] T051 [P] Add an "Appearance" section to `README.md` and any needed notes to `setup.md` (storage key, System/Light/Dark, map basemaps).
- [x] T052 [P] Document `flights.tileLayers` in `public/config.json` and the `src/config.ts` defaults.
- [x] T053 [P] Finalize changesets in `../home-sweet-home-modules/.changeset/` and publish `@sousa99/homesweethome-theme@0.1.0` plus the five widget minors. Published via modules PRs #32/#33; release run 41365145732.
- [x] T054 Update this repo's `package.json` widget pins and `pnpm-lock.yaml` to the published versions from T053. Pins are now `^0.1.0`/`^0.3.0`/`^0.2.0`/`^0.6.0`/`^0.3.0`/`^0.2.0`; local gates and e2e pass against the published packages.
- [x] T055 Run the full gates defined in `package.json`: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm -r build:lib` (modules), `pnpm test:e2e`, `pnpm build` (dashboard).
- [ ] T056 Run `docker-compose.yml` stack with `docker compose up -d --build` and verify the dashboard on `:3304` in both appearances with the real backends. **PARTIAL**: the PR CI Docker build and the main release image cover the image build; the full compose smoke with backends has not been run locally.
- [x] T057 Validate `quickstart.md` end-to-end and record any deviations.
- [x] T058 [P] Confirm no generated screenshots or temp scripts are committed (`git status`), and remove stale preview references from `specs/003-dashboard-theme-refresh/`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; **blocks all user stories**.
- **US1 (Phase 3)**: Depends on Foundational; **MVP**.
- **US2 (Phase 4)**: Depends on US1 (shared refactored classes and light verification).
- **US3 (Phase 5)**: Depends on US1 and US2 (audits both appearances).
- **US4 (Phase 6)**: Depends on US1 (tokens) and US2 (usable dark); can start once US2's token work lands.
- **Polish (Phase 7)**: Depends on all stories.

### User Story Dependencies

- **US1 (P1)**: No story dependencies after Foundational.
- **US2 (P1)**: Builds on US1; delivers dark independently of US4.
- **US3 (P1)**: Verification/consistency layer over US1+US2.
- **US4 (P2)**: Adds preference control; dark must already be usable.

### Within Each User Story

- Tests MUST be written and FAIL before implementation.
- Shared components before package-specific components; package refactors before dashboard-wide audits.
- Guards/tests before cleanup; cleanup before builds/story checks; builds before e2e.

---

## Parallel Opportunities

- Phase 1: T002 and T003.
- Phase 2: T005, T007–T013, T015.
- US1: T017–T025 are parallel across different packages/files; T016 (test) can be written in parallel.
- US2: T029/T030 tests in parallel; T032/T033 config and block selection in parallel.
- US3: T037/T038 in parallel.
- US4: T043/T044 tests in parallel; T046 (control) parallel with T048 (boot script).
- Polish: T050–T053 in parallel.

### Parallel Example: US1

```bash
# Different packages / files, no shared edits:
Task: "Refactor WidgetStatusBar in ../home-sweet-home-modules/packages/components/src/WidgetStatusBar.tsx"
Task: "Refactor current-time in ../home-sweet-home-modules/modules/current-time/frontend/src/"
Task: "Refactor bus-catcher in ../home-sweet-home-modules/modules/bus-catcher/frontend/src/"
Task: "Refactor weather-psychic in ../home-sweet-home-modules/modules/weather-psychic/frontend/src/"
Task: "Refactor fly-over-tracker in ../home-sweet-home-modules/modules/fly-over-tracker/frontend/src/"
Task: "Refactor procrastinator-tracker in ../home-sweet-home-modules/modules/procrastinator-tracker/frontend/src/"
Task: "Restyle dashboard shell in src/index.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Setup + Foundational (shared tokens, guards, resolver).
2. Complete US1 (light identity) and **STOP**.
3. Validate: light e2e + responsive matrix + palette guards + Storybook light review.
4. Demo the new light dashboard.

### Incremental Delivery

1. Setup + Foundational → tokens available everywhere.
2. US1 → new light identity (MVP).
3. US2 → first-class dark appearance.
4. US3 → consistency enforced across modules.
5. US4 → manual System/Light/Dark control with persistence and no flash.
6. Polish → docs, releases, pins, full-stack smoke.

### Notes

- Tests are mandatory in both repos; keep Red → Green → Refactor.
- Do not change layout, data behavior, proxy config, or backend images.
- Release the theme package before widgets, widgets before the dashboard pin bump.
- Stop at each checkpoint to validate the story independently before continuing.
