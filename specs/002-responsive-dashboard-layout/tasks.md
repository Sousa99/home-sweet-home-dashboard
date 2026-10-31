---
description: 'Task list for the responsive multi-device dashboard layout feature'
---

# Tasks: Responsive Multi-Device Dashboard Layout

**Input**: Design documents from `/specs/002-responsive-dashboard-layout/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED. The project constitution mandates test-first (NON-NEGOTIABLE), so every user
story phase begins with failing Vitest tests before implementation.

**Organization**: Tasks are grouped by user story so each story is independently implementable and
testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single project: `src/` and `tests/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the baseline and add the shared test/constant scaffolding used by all stories.

- [x] T001 Run `pnpm install && pnpm test && pnpm typecheck && pnpm lint` at the repo root and record the baseline (all existing tests green) before changing code.
- [x] T002 [P] Add a reusable `matchMedia` mock helper with width/height setters and listener dispatch in tests/helpers/matchMedia.ts.
- [x] T003 [P] Create the block identifier constants and default orders (`BlockId`, `DEFAULT_BLOCK_ORDER`, `TABLET_BLOCK_ORDER`) in src/layout/blocks.ts.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Viewport classification, layout resolution, config shape, and base CSS that every user
story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Write failing unit tests for `resolveViewportClass` covering 320/390/639/640/1023/1024/1919/1920 px and landscape phones (844×390) in tests/viewport.test.tsx.
- [x] T005 [P] Write failing unit tests for `sanitizeBlockOrder`/`resolveLayout` covering defaults, custom phone order, missing blocks appended, unknown/duplicate ids, all-hidden fallback, and desktop/TV ignoring overrides in tests/layout.test.ts.
- [x] T006 [P] Write failing tests for `layout` deep-merge and array-replacement behavior in tests/config.test.ts.
- [x] T007 Implement `resolveViewportClass(width, height, isLandscape)` and `useViewportClass()` (matchMedia subscriptions, resize/orientation cleanup, `data-viewport` on `<html>` via `useLayoutEffect`) in src/layout/useViewportClass.ts.
- [x] T008 Implement `sanitizeBlockOrder` and `resolveLayout(layoutConfig, viewportClass)` returning `{ order, hidden, scroll, compact }` in src/layout/layout.ts.
- [x] T009 Extend `src/config.ts` with `BlockId`, `LayoutConfig`, defaults (`phoneOrder`, `hiddenOnPhone`, `hiddenOnTablet`), and sanitization in `loadConfig` so invalid `layout` values never throw.
- [x] T010 [P] Add a `matchMedia` polyfill/default to tests/setup.ts so existing dashboard tests render deterministically without a real window viewport.
- [x] T011 [P] Add `viewport-fit=cover` to the meta viewport in index.html and base viewport CSS (page scroll policy per `data-viewport`, root `16px` override on phone/tablet, `100dvh`, safe-area padding, reduced-motion reset) in src/index.css.

**Checkpoint**: Classification, config, and layout resolution are tested and working; user stories can begin.

---

## Phase 3: User Story 1 - Use the Dashboard on a Phone (Priority: P1) 🎯 MVP

**Goal**: A single scrolling column with a compact first-screenful "Now" area (time, bus, weather,
tasks) and every block reachable in a configurable order.

**Independent Test**: Load at 390×844 with default config and confirm no horizontal scrolling, the
header plus bus/weather/tasks visible in the first screenful, and flights/map/status reachable by
scrolling.

### Tests for User Story 1 (write first, confirm they fail) ⚠️

- [x] T012 [P] [US1] Add phone shell tests to tests/dashboard.test.tsx: `data-viewport="phone"`, header present, all blocks rendered, default order bus → weather → tasks → flights → map → status, compact status, and no desktop grid marker.
- [x] T013 [P] [US1] Add compact block tests in tests/blocks.test.tsx: `BusBlock` caps departures at 2, `WeatherBlock` applies the compact height class, `TasksBlock` sets the compact deck height, and `StatusBlock` renders a one-line summary with an accessible per-module label.

### Implementation for User Story 1

- [x] T014 [P] [US1] Add a `compact?: boolean` prop to src/blocks/BusBlock.tsx that caps each stop's `limit` at 2 when true.
- [x] T015 [P] [US1] Add a `compact?: boolean` prop to src/blocks/WeatherBlock.tsx that renders a compact summary with a Details expand toggle and keeps the widget mounted.
- [x] T016 [P] [US1] Add a `compact?: boolean` prop to src/blocks/TasksBlock.tsx that sets the task deck height to ~12rem via the widget `style` custom property.
- [x] T017 [P] [US1] Add a `compact?: boolean` variant to src/blocks/StatusBlock.tsx (single line: overall state, down count, last checked; full module list exposed to assistive tech; neutral "Checking…" with no data).
- [x] T018 [US1] Refactor src/layout/DashboardGrid.tsx into a single stable DOM tree using `useViewportClass` + `resolveLayout`, applying config order/visibility, compact props, and rendering the map last on phone without unmounting any block.
- [x] T019 [US1] Add phone layout CSS in src/index.css: single-column flex ordering, sticky compact header, 44px minimum touch targets, compact block heights, safe-area insets, and page-level vertical scrolling with no horizontal overflow.
- [x] T020 [P] [US1] Add the default `layout` object to public/config.json and document `layout.phoneOrder` / `hiddenOnPhone` / `hiddenOnTablet` in docs/configuration.md.
- [x] T021 [US1] Validate US1 per quickstart.md at 390×844, 320×568, and 844×390 and fix any clipping/order issues in src/index.css and src/layout/DashboardGrid.tsx.

**Checkpoint**: Phone layout is fully functional and independently testable — MVP ready.

---

## Phase 4: User Story 2 - Preserve the TV / Large-Screen Experience (Priority: P1)

**Goal**: Desktop and TV keep the current three-column, non-scrolling arrangement and ignore the
phone/tablet layout overrides.

**Independent Test**: Load at 1920×1080 and 3840×2160 and confirm the three-column arrangement, all
blocks visible without scrolling, and no change from the pre-feature build.

### Tests for User Story 2 (write first, confirm they fail) ⚠️

- [x] T022 [P] [US2] Add TV/desktop regression tests to tests/dashboard.test.tsx at 1440×900, 1920×1080, and 3840×2160: `data-viewport`, non-scrolling shell, three-column grid placement, all blocks present, and block order unaffected by `phoneOrder`.
- [x] T023 [P] [US2] Add tests to tests/layout.test.ts asserting `resolveLayout` ignores `phoneOrder`/hidden lists for `desktop`/`tv` and always returns `scroll=false`, `compact=false`.

### Implementation for User Story 2

- [x] T024 [US2] Implement desktop/TV grid areas and `overflow: hidden` in src/index.css and ensure src/layout/DashboardGrid.tsx places flights+weather left, map center, tasks+bus right, with the status footer full width.
- [x] T025 [US2] Validate the TV regression per quickstart.md at 1920×1080 and 3840×2160 against the pre-change build and fix any visual drift in src/index.css.

**Checkpoint**: Phone works and TV/desktop are unchanged.

---

## Phase 5: User Story 3 - Use the Dashboard on a Tablet (Priority: P2)

**Goal**: A two-column tablet layout with full-width header/status, flights grouped left and
weather/tasks/bus grouped right.

**Independent Test**: Load at 768×1024 and 1024×768, confirm two columns (or the defined boundary
arrangement), no horizontal overflow, and no duplicate compact summary.

### Tests for User Story 3 (write first, confirm they fail) ⚠️

- [x] T026 [P] [US3] Add tablet render tests to tests/dashboard.test.tsx at 768×1024, 800×600 split-screen, and 1024×768: `data-viewport`, two-column/boundary arrangement, header and status full width, no compact status.
- [x] T027 [P] [US3] Add tests to tests/layout.test.ts for `hiddenOnTablet` filtering and for `resolveLayout('tablet')` always returning `compact=false`, `scroll=true`.

### Implementation for User Story 3

- [x] T028 [US3] Implement the tablet two-column grid areas and spacing in src/index.css and wire `hiddenOnTablet` + non-compact props in src/layout/DashboardGrid.tsx.
- [x] T029 [US3] Validate US3 per quickstart.md at 768×1024 and 1024×768, including orientation change, and fix any clipping in src/index.css.

**Checkpoint**: Phone, tablet, desktop, and TV arrangements all render correctly.

---

## Phase 6: User Story 4 - Adapt Live to Resizing and Rotation (Priority: P3)

**Goal**: Layout switches at class boundaries during resize/rotation without reload, horizontal
overflow, or loss of widget state.

**Independent Test**: Resize continuously from 390×844 to 1920×1080 and back; the layout switches
live, no horizontal scrollbar appears, and task rotation/data survive.

### Tests for User Story 4 (write first, confirm they fail) ⚠️

- [x] T030 [P] [US4] Add tests to tests/viewport.test.ts that matchMedia change events update the class, listeners are cleaned up on unmount, and orientation changes are handled.
- [x] T031 [P] [US4] Add a test to tests/dashboard.test.tsx asserting the same widget DOM nodes persist across a simulated phone → tablet → TV class change (no remount).

### Implementation for User Story 4

- [x] T032 [US4] Finalize src/layout/useViewportClass.ts to subscribe to both width and height queries, use `useLayoutEffect` for the `<html>` attribute, clean up all listeners, and avoid unnecessary state updates when the class is unchanged.
- [x] T033 [US4] Ensure src/layout/DashboardGrid.tsx keeps stable keys and one tree so class changes only alter classes/order/style, never mount/unmount blocks.
- [x] T034 [US4] Validate continuous resize and rotation per quickstart.md and fix reflow/scrollbar issues in src/index.css.

**Checkpoint**: All four user stories are independently functional and integrated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, accessibility, and full quality-gate verification.

- [x] T035 [P] Update the responsive/layout section of README.md and the `layout` reference in docs/configuration.md with the viewport classes, default order, and hidden-block behavior.
- [x] T036 [P] Run `pnpm format:write && pnpm lint && pnpm typecheck && pnpm test && pnpm build` and fix any failures across src/ and tests/.
- [x] T037 [P] Verify accessibility per quickstart.md: 44×44 touch targets, focus order matches visual order, compact status exposes per-module state non-visually, and reduced motion disables dashboard transitions.
- [x] T038 Run the full quickstart.md matrix (320–3840 px, phone portrait/landscape, tablet portrait/landscape, desktop, TV, 200% zoom) and confirm zero horizontal page scrolling and no clipped blocks.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **US1 Phone (Phase 3, P1)**: Depends on Foundational. MVP.
- **US2 TV (Phase 4, P1)**: Depends on Foundational; verifies the desktop/TV branch introduced in US1.
- **US3 Tablet (Phase 5, P2)**: Depends on Foundational and benefits from US1's shell refactor.
- **US4 Live resize (Phase 6, P3)**: Depends on US1–US3 being in place to exercise all boundaries.
- **Polish (Phase 7)**: Depends on all desired stories.

### User Story Dependencies

- **US1**: Independent after Phase 2; delivers the MVP.
- **US2**: Independent test target after Phase 2, but the shared shell is refactored in US1, so run
  US1 before US2 in a single-developer flow.
- **US3**: Independent after the shell exists (US1); can run in parallel with US2 by a second
  developer because it touches tablet CSS and tests only.
- **US4**: Should follow US1–US3; it verifies transitions across all classes.

### Within Each User Story

- Tests first and failing before implementation.
- Pure helpers/config before shell wiring.
- Block adapters before the grid consumes them.
- Story validation before moving to the next story.

### Parallel Opportunities

- T002/T003 can run together.
- T004/T005/T006 (test files) can run together; T007/T008 (helpers) can run together afterwards.
- T010/T011 can run together.
- T012/T013 (phone tests) together; T014–T017 (four block adapters) together.
- T022/T023 (TV tests) together.
- T026/T027 (tablet tests) together.
- T030/T031 (resize tests) together.
- T035/T036/T037 are independent polish checks.

---

## Parallel Example: User Story 1

```bash
# Tests first (different files):
Task: "Add phone shell tests in tests/dashboard.test.tsx"
Task: "Add compact block tests in tests/blocks.test.tsx"

# Then the four block adapters (different files):
Task: "Add compact prop to src/blocks/BusBlock.tsx"
Task: "Add compact prop to src/blocks/WeatherBlock.tsx"
Task: "Add compact prop to src/blocks/TasksBlock.tsx"
Task: "Add compact variant to src/blocks/StatusBlock.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add tablet render tests in tests/dashboard.test.tsx"
Task: "Add hiddenOnTablet/resolveLayout tests in tests/layout.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational) — classification, config, base CSS.
3. Complete Phase 3 (US1 phone layout).
4. **STOP and VALIDATE**: 390×844 phone check per quickstart.
5. Deploy/demo the phone-capable dashboard.

### Incremental Delivery

1. Setup + Foundational → shell can classify and resolve layouts.
2. US1 → phone works (MVP).
3. US2 → TV regression test/verification, guaranteeing the primary experience.
4. US3 → tablet two-column layout.
5. US4 → live resize/rotation polish.
6. Polish → docs, accessibility, full gate run.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After Foundational:
   - Developer A: US1 (shell + phone).
   - Developer B: US2 tests and TV verification once the shell lands.
   - Developer C: US3 tablet CSS/tests after the shell lands.
3. US4 and polish follow integration.

---

## Notes

- [P] tasks touch different files and have no incomplete dependencies.
- [Story] labels provide traceability to spec.md user stories.
- Tests MUST fail before implementation per the constitution.
- TV/desktop must remain visually equivalent; treat any drift as a regression.
- Vertical scrolling is allowed only for `phone` and `tablet`; never horizontal page scrolling.
- Do not modify `deploy/nginx.conf` or `vite.config.ts`; the proxy contract is unchanged.

### Added during implementation: headless validation

- [x] T039 [P] Add `@playwright/test`, `playwright.config.ts` (8 viewport projects + Vite web server), the `test:e2e` script, and the `test-results/`/`playwright-report/` ignore entries.
- [x] T040 [P] Add deterministic module-API and map-tile mocks in tests/e2e/fixtures.ts.
- [x] T041 Add the real-browser responsive matrix in tests/e2e/responsive.spec.ts: horizontal overflow, block bounds, phone first-screen fold, TV containment, 44px targets, screenshots, and weather expand interaction.
- [x] T042 Add the cached Chromium install + `pnpm test:e2e` step to .github/workflows/ci.yml and document the one-time browser install in README.md, AGENTS.md, and quickstart.md.
- [x] T043 Fix defects found by the headless run: compact weather summary + Details expansion in src/blocks/WeatherBlock.tsx, compact bus status handling and narrow-phone rules in src/index.css, and the updated block tests in tests/blocks.test.tsx.
