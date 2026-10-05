---
description: 'Task list for updating the flight-scanner (fly-over-tracker) module to 0.5.0'
---

# Tasks: Update the Flight-Scanner Version

**Input**: Design documents from `/specs/001-flight-scanner-version/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: REQUIRED — the project constitution makes test-first non-negotiable. A pin-contract
test is written first and must fail before each declaration change, then pass.

**Organization**: Tasks are grouped by user story so each story is independently implementable and
testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project at repository root: `src/`, `tests/`, plus root declaration files.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the toolchain and capture the baseline so unrelated pins are provably untouched.

- [X] T001 Confirm toolchain and registry access (Node.js >= 24, pnpm 11, `@sousa99` scope auth) per `setup.md`
- [X] T002 Record the baseline version pins in `package.json`, `docker-compose.yml`, `.env.example`, and `docs/versions.md` (notably the other three modules) for the later diff check

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared test scaffolding used by every story's pin-contract assertions.

**⚠️ CRITICAL**: Complete before the user-story test tasks.

- [X] T003 [P] Add a shared declaration reader at `tests/helpers/declarations.ts` that reads and exposes the fly-over-tracker values from `package.json`, `docker-compose.yml`, `.env.example`, and `docs/versions.md`

**Checkpoint**: Reader helper available — user-story phases can begin.

---

## Phase 3: User Story 1 - Latest flight widgets on the dashboard (Priority: P1) 🎯 MVP

**Goal**: The dashboard's embedded flight widgets resolve to the latest published release (`0.5.0`).

**Independent Test**: `pnpm install --frozen-lockfile` succeeds and `pnpm test -- versions.test.ts`
passes the widget assertions (specifier `^0.5.0`, lockfile resolved `0.5.0`); `pnpm build` succeeds.

### Tests for User Story 1 (write first, must FAIL) ⚠️

- [X] T004 [US1] Create `tests/versions.test.ts` asserting the `@sousa99/fly-over-tracker-components` specifier in `package.json` is `^0.5.0` and `pnpm-lock.yaml` resolves it to `0.5.0`; run it and confirm it FAILS on the current `^0.4.2`

### Implementation for User Story 1

- [X] T005 [US1] Bump `"@sousa99/fly-over-tracker-components"` to `^0.5.0` in `package.json`
- [X] T006 [US1] Run `pnpm install` to regenerate `pnpm-lock.yaml` with the resolved `0.5.0` widget
- [X] T007 [US1] Verify `pnpm test -- versions.test.ts` (widget assertions) passes and `pnpm build` succeeds

**Checkpoint**: The dashboard runs the `0.5.0` flight widgets — MVP deliverable.

---

## Phase 4: User Story 2 - Aligned flight-scanner backend (Priority: P2)

**Goal**: The flight-scanner backend service defaults to the same release (`0.5.0`) as the widgets.

**Independent Test**: `docker compose config` resolves the flight-scanner backend image to
`:0.5.0` and the backend assertions in `tests/versions.test.ts` pass.

### Tests for User Story 2 (write first, must FAIL) ⚠️

- [X] T008 [US2] Extend `tests/versions.test.ts` with assertions that both `docker-compose.yml` fly-over image defaults and `.env.example` `HSH_FLY_OVER_TRACKER_BACKEND_VERSION` equal `0.5.0`; confirm it FAILS on the current `0.3.0`

### Implementation for User Story 2

- [X] T009 [US2] Update the `fly-over-tracker-backend` and `fly-over-tracker-mcp` image defaults to `0.5.0` in `docker-compose.yml`
- [X] T010 [US2] Update `HSH_FLY_OVER_TRACKER_BACKEND_VERSION=0.5.0` in `.env.example`
- [X] T011 [US2] Verify `pnpm test -- versions.test.ts` (backend assertions) passes and `docker compose config` resolves `ghcr.io/sousa99/fly-over-tracker-backend:0.5.0`

**Checkpoint**: Widget and backend are aligned on `0.5.0`.

---

## Phase 5: User Story 3 - Truthful version documentation (Priority: P3)

**Goal**: The documented current pins match the declared widget and backend versions.

**Independent Test**: `tests/versions.test.ts` (docs assertions) passes and `docs/versions.md` shows
`^0.5.0` / `0.5.0` for the fly-over-tracker row.

### Tests for User Story 3 (write first, must FAIL) ⚠️

- [X] T012 [US3] Extend `tests/versions.test.ts` with assertions that the `fly-over-tracker` current-pins row in `docs/versions.md` equals the declared components specifier and backend tag; confirm it FAILS on the current `^0.3.0` / `0.3.0`

### Implementation for User Story 3

- [X] T013 [US3] Update the `fly-over-tracker` current-pins row to `^0.5.0` / `0.5.0` in `docs/versions.md`
- [X] T014 [US3] Verify `pnpm test -- versions.test.ts` (docs assertions) passes

**Checkpoint**: Declarations and documentation agree.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm scope boundaries and that the full gate suite is green.

- [X] T015 [P] Confirm no other module's pins changed by diffing `package.json`, `docker-compose.yml`, `.env.example`, and `docs/versions.md` against the T002 baseline
- [X] T016 [P] Confirm the proxy/API contract is untouched (`deploy/nginx.conf`, `vite.config.ts`) per `contracts/api-compatibility.md`
- [X] T017 Run the full quality gates: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- [X] T018 [P] Run the `quickstart.md` validation steps (frozen install, `docker compose config`; optional stack smoke test)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — provides the shared reader used by all story tests
- **User Stories (Phase 3+)**: Depend on Foundational; proceed in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational
- **US2 (P2)**: Independent after Foundational (widget/backend are separate knobs)
- **US3 (P3)**: Independent after Foundational; asserts consistency with US1/US2 declared values

### Within Each User Story

- The pin-contract test extension is written and FAILS before the declaration is changed
- Declaration change precedes the verification task

### Parallel Opportunities

- T003 can run in parallel with T001/T002 once started
- T015, T016, and T018 are independent and can run in parallel
- `tests/versions.test.ts` is shared by T004, T008, and T012, so those tasks are **sequential**
- The three stories touch different declaration files (US1: `package.json`/lockfile; US2: `docker-compose.yml`/`.env.example`; US3: `docs/versions.md`) but share the test file, so run them in priority order

---

## Parallel Example: Polish

```bash
# After all stories are complete, run the independent checks together:
Task: "Confirm no other module pins changed in package.json, docker-compose.yml, .env.example, docs/versions.md"
Task: "Confirm proxy/API contract untouched in deploy/nginx.conf and vite.config.ts"
Task: "Run quickstart.md validation steps"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (widget on `0.5.0`)
4. **STOP and VALIDATE**: `pnpm install --frozen-lockfile` + `pnpm test -- versions.test.ts` + `pnpm build`
5. Demo the updated flight widgets

### Incremental Delivery

1. Setup + Foundational → reader ready
2. US1 → widget at `0.5.0` (MVP)
3. US2 → backend aligned at `0.5.0`
4. US3 → documentation truthful
5. Polish → full gates + scope-boundary checks

---

## Notes

- [P] tasks touch different files with no incomplete dependencies
- The single pin-contract test file (`tests/versions.test.ts`) grows across US1 → US2 → US3; those
  tasks are intentionally sequential
- Verify each test fails before making its declaration change (constitution: test-first)
- Commit after each logical group
- Avoid changing any non-fly-over-tracker pins
