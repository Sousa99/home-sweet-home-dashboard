# Implementation Plan: Responsive Multi-Device Dashboard Layout

**Branch**: `002-responsive-dashboard-layout` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-responsive-dashboard-layout/spec.md`

## Summary

Make the dashboard adapt to phone, tablet, desktop/laptop, and large-screen/TV viewports while
preserving today's TV layout exactly. The approach is a single responsive DOM tree (no per-viewport
remounts) driven by a small viewport-class hook that sets `data-viewport` on the document, CSS grid
arrangements per class, config-driven block order/visibility for small screens, and compact sizing
for the phone "Now" area. Scrolling is introduced **only** on phone and tablet; TV/desktop stay
fixed and non-scrolling.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.3

**Primary Dependencies**: Vite 6, Tailwind CSS v4, published module widgets
(`@sousa99/*-components`), `lucide-react`

**Storage**: N/A — runtime config from `/config.json` (`public/config.json` in development)

**Testing**: Vitest 3 + @testing-library/react + jsdom; Playwright + headless Chromium for the
responsive matrix (mocked APIs); manual device checks via `quickstart.md`

**Target Platform**: Modern evergreen browsers on phones, tablets, laptops/desktops, and TV/large
displays (320 px to 3840 px wide).

**Project Type**: Single-project web SPA (Vite + React), no backend in this repository.

**Performance Goals**: Viewport reflow within one frame on resize; no layout thrash or data refetch
caused by class changes; retain 60 fps widget animation on TV.

**Constraints**: TV layout visually unchanged; no page-level horizontal scrolling anywhere;
published widgets consumed unmodified; root rem scaling preserved; reduced-motion respected;
safe-area insets respected; proxy contract and refresh cadences unaffected.

**Scale/Scope**: 6–7 blocks, 4 viewport classes, 1 layout shell, 1 small viewport hook, config
extension, responsive styling.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                | Check                                                                                                                                                | Result |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Dashboard-First                       | Uses the published widgets as-is; only arranges, sizes, and orders them. No module forks or source copies.                                           | PASS   |
| II. Local-First & Private                | No new network calls, cloud services, or data leaving the host. Existing local backends only.                                                        | PASS   |
| III. Declared Identity & Uniform Tooling | No package/identity changes; ESLint/Prettier/typecheck/Vitest configs untouched.                                                                     | PASS   |
| IV. Test-First (NON-NEGOTIABLE)          | Plan starts with failing tests for viewport classification, config merge, and layout shell rendering per class.                                      | PASS   |
| V. Contract & Integration                | `/api/<module>` proxies, base URLs, health probing, and refresh cadences are unchanged. UI/viewport and config contracts documented in `contracts/`. | PASS   |

**AGENTS.md TV adaptation guideline**: "do not introduce scrolling layouts." The spec intentionally
permits vertical scrolling on phone and tablet only, where the full information set cannot fit.
TV and desktop remain non-scrolling. This deviation is scoped and recorded in Complexity Tracking.

**Post-design re-check**: PASS — design keeps one DOM, published widgets, unchanged proxy, and
adds tests before implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-responsive-dashboard-layout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── layout-contract.md
│   └── layout-config.schema.json
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── App.tsx                       # loads config, renders shell
├── config.ts                     # + LayoutConfig types, defaults, sanitization
├── index.css                     # + viewport class rules, scroll policy, safe areas, type scale
├── layout/
│   ├── DashboardGrid.tsx         # responsive single-tree layout
│   ├── useViewportClass.ts       # matchMedia-based classification + data-viewport
│   ├── layout.ts                 # pure resolveLayout(config, class) helpers
│   └── blocks.ts                 # BlockId union + default orders
├── blocks/
│   ├── BusBlock.tsx              # accepts compact sizing/limit hints
│   ├── WeatherBlock.tsx          # compact height on phone
│   ├── TasksBlock.tsx            # compact deck height on phone
│   ├── FlightPanelBlock.tsx      # unchanged API
│   ├── FlightMapBlock.tsx        # deferred below the fold on phone
│   ├── StatusBlock.tsx           # compact single-line variant on phone
│   ├── ClockBlock.tsx            # unchanged
│   └── PlaceholderBlock.tsx      # unchanged
└── components/
    └── DateReadout.tsx           # unchanged

playwright.config.ts              # NEW: viewport projects + Vite web server
tests/
├── config.test.ts                # + layout config merge/sanitization
├── viewport.test.tsx             # NEW: classification + resize listeners
├── layout.test.ts                # NEW: order/visibility resolution
├── blocks.test.tsx               # NEW: compact props + weather expand toggle
├── dashboard.test.tsx            # + per-viewport shell assertions
├── helpers/matchMedia.ts         # NEW: deterministic viewport mocks
├── e2e/
│   ├── fixtures.ts               # NEW: mocked module APIs + map tiles
│   └── responsive.spec.ts        # NEW: real layout matrix + screenshots
└── setup.ts
```

**Structure Decision**: Extend the existing single-project SPA. Layout behavior lives in
`src/layout/`; block-level compact presentation stays in the block adapters so published widgets
remain untouched. No new packages or directories beyond `src/layout/`.

## Phase 0: Research

See [research.md](./research.md). All technical unknowns are resolved:

- Viewport classes and breakpoints.
- CSS-first vs. JS-driven layout switching (chosen: hybrid, single DOM).
- Scroll policy per viewport class.
- Root type scaling and compact block sizing.
- Config-driven phone ordering and visibility.
- Safe-area and reduced-motion handling.
- Testing strategy for layout without adding a browser-automation dependency.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) — viewport classes, layout config, resolved layout plan,
  validation rules.
- [contracts/layout-contract.md](./contracts/layout-contract.md) — UI behavior contract per
  viewport class.
- [contracts/layout-config.schema.json](./contracts/layout-config.schema.json) — runtime config
  shape for `layout`.
- [quickstart.md](./quickstart.md) — runnable verification steps per viewport.

## Complexity Tracking

| Deviation                               | Why Needed                                                                                                                                                                                                       | Simpler Alternative Rejected Because                                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Vertical page scrolling on phone/tablet | All blocks cannot fit legibly on a small screen; scrolling is the only way to keep every block reachable without hiding data or shrinking below readable size. Scoped to `< 1024 px` width and landscape phones. | A fully non-scrolling phone layout would require dropping blocks or unreadable text, violating FR-005/FR-010 and the user's core request. |
| Config extension (`layout`)             | FR-016 requires priority and visibility to be adjustable without code changes, matching the repo's config-first convention.                                                                                      | Hardcoding phone order would drift from `public/config.json` and require rebuilds for household customization.                            |
| Small JS viewport hook                  | Classification must be testable and shared by ordering, compact sizing, and status behavior; CSS media queries alone cannot reorder blocks from runtime config.                                                  | Pure-CSS ordering cannot honor `layout.phoneOrder`, and duplicated breakpoints in CSS and TS would drift.                                 |
