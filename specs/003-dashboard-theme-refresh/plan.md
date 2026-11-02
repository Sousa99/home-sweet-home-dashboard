# Implementation Plan: Dashboard Visual Identity Refresh (Light & Dark)

**Branch**: `feature/003-dashboard-theme-refresh` | **Date**: 2026-11-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-dashboard-theme-refresh/spec.md`

## Summary

Replace the dashboard's warm amber/slate look with a restrained neo-brutalist identity in both light
and dark appearances, and make every published module widget speak the same visual language. The
approach is a shared, published semantic-token package (off-white/ink in light, near-black/ink in
dark, one accent per appearance, 0 radius, 3px outlines, 6px hard shadows, bold uppercase display
type). Each module frontend is simplified to consume those tokens instead of raw Tailwind palette
utilities, then re-released; the dashboard pins the new versions, consumes the same tokens for its
shell and host blocks, adds a System/Light/Dark control with persistence, and swaps the map basemap
per appearance. All changes are presentation-only and are verified with token-contrast tests, a
raw-palette guard, unit tests for preference resolution, and the existing Playwright responsive
matrix extended with theme checks.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, CSS (Tailwind CSS v4), Vite 6

**Primary Dependencies**: Tailwind CSS v4 (`@theme` / `@theme inline`), `lucide-react`,
`leaflet`/`react-leaflet`, published `@sousa99/*-components` widgets, new published
`@sousa99/homesweethome-theme` package

**Storage**: `localStorage` for the manual theme preference; runtime block options in
`public/config.json` (map basemap URLs); no database changes

**Testing**: Vitest + React Testing Library (token contrast parser, preference resolver, palette
guard), Playwright layout matrix extended with light/dark assertions; existing module Vitest suites

**Target Platform**: Browser SPA served by nginx; TV/large-screen (1080p–4K) plus phone/tablet
responsive layouts

**Project Type**: Web application (single SPA) plus coordinated changes in the sibling module
monorepo's published frontend packages

**Performance Goals**: Theme applied before first paint (no flash); manual switch visible in under
one second and without reload; no measurable layout shift; added CSS ≤ 10 KB gzip; no new runtime JS
dependency beyond a small preference hook

**Constraints**: Presentation-only; TV layout remains non-scrolling; 4.5:1 text contrast and 3:1
non-text/UI contrast in both appearances; square corners (0 radius), 3px-equivalent outlines,
6px-equivalent hard shadows, one accent per appearance; widgets remain independently pinned; no
webfont downloads; map tiles keep using an external key-less provider as they do today

**Scale/Scope**: 8 dashboard blocks, 5 published widget packages, 2 appearances, 8 Playwright
viewports, 2 repositories (dashboard + modules monorepo)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Dashboard-First** — PASS. The dashboard remains the single host app; module changes happen in
  their own packages and are consumed from GitHub Packages. No module source is added here.
- **II. Local-First & Private by Default** — PASS. The preference is stored locally, no theme settings
  leave the device, system fonts are used, and map tiles continue to use the existing external
  basemap pattern (now with a dark variant).
- **III. Declared Identity & Uniform Tooling** — PASS. Both repos keep the shared
  `@sousa99/homesweethome-config` presets; the new theme package centralizes visual tokens instead of
  duplicating them per module.
- **IV. Test-First (NON-NEGOTIABLE)** — PASS. Every behavior change (token contrast, preference
  resolution, persistence, palette guard, map tile selection) starts with a failing test in the
  owning repo before implementation.
- **V. Contract & Integration Testing** — PASS. The token contract, widget consumption rules, theme
  attribute/storage contract, and map tile props are documented and tested; the `/api/<module>` proxy
  and `deploy/nginx.conf` ↔ `vite.config.ts` parity are untouched.

**Post-design re-check**: PASS. Phase 1 artifacts preserve all five principles; no violations require
complexity tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-dashboard-theme-refresh/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── theme-tokens.md
│   ├── theme-preference.md
│   └── widget-theme-consumption.md
├── checklists/
│   └── requirements.md
└── tasks.md                    # created by /speckit.tasks
```

### Source Code (repository root — dashboard)

```text
src/
├── theme/
│   ├── useTheme.ts             # System/Light/Dark resolution, persistence, media listener
│   └── ThemeControl.tsx        # segmented System/Light/Dark control (host-owned)
├── index.css                   # imports the theme package; global shell styles use semantic tokens
├── main.tsx                    # imports theme package CSS before widget styles
├── App.tsx                     # loading shell uses tokens
├── components/DateReadout.tsx
├── blocks/                     # Weather/Bus/Tasks/Flight/Status/Placeholder host blocks
├── layout/DashboardGrid.tsx    # headings + map tile selection
├── layout/blocks.ts
├── config.ts                   # typed theme/tile options + defaults
└── lib/status.ts

index.html                      # inline boot script + critical background (no FOUC)
public/config.json              # documented tile basemap defaults
tests/
├── theme/tokens.test.ts        # WCAG contrast + token completeness
├── theme/useTheme.test.tsx     # resolution, persistence, media/storage events
├── theme/palette-guard.test.ts # no raw palette utilities in shell or widget sources
└── e2e/theme.spec.ts           # Playwright light/dark matrix
```

### Source Code (sibling checkout — `../home-sweet-home-modules`)

```text
packages/
├── theme/                      # NEW published @sousa99/homesweethome-theme
│   ├── package.json            # exports ./theme.css (+ token TS for tests)
│   └── src/theme.css           # @theme inline mapping, :root/[data-theme] values, primitives
└── components/                 # shared WidgetStatusBar refactor to semantic tokens

modules/
├── weather-psychic/frontend/src/index.css      # @import theme; @source shared
├── weather-psychic/frontend/src/components/*   # semantic tokens + simplification
├── bus-catcher/frontend/src/...
├── current-time/frontend/src/...
├── fly-over-tracker/frontend/src/...           # + dark tileUrl/attribution props
└── procrastinator-tracker/frontend/src/...
```

**Structure Decision**: Two coordinated workstreams. The module monorepo owns the shared theme
package and all widget refactors/releases; this dashboard repo owns preference handling, shell/block
restyling, map basemap selection, and consumption of the newly published versions. The dashboard
never imports module source.

## Implementation Strategy

### Workstream A — Shared theme package (modules monorepo, first)

1. **Test-first**: add `packages/theme` contract tests (token completeness, contrast pairs, selector
   coverage) and a source scan that forbids raw palette utilities in module frontends.
2. Create `@sousa99/homesweethome-theme` (`publishConfig` → GitHub Packages) exporting:
   - `./theme.css`: `@theme inline` semantic mappings, `:root`/`[data-theme='light']` and
     `[data-theme='dark']` values, `color-scheme`, shared `.hsh-*` primitives (surface, heading,
     button, badge, input, focus ring).
   - `./tokens`: typed token names/values for tests and docs.
3. Refactor `packages/components` (`WidgetStatusBar`) and all five frontends:
   - Replace palette utilities (`bg-white`, `text-slate-*`, `border-amber-*`, `rounded-*`,
     `shadow-sm`, gradients) with semantic token utilities and `.hsh-*` primitives.
   - Flatten surfaces, remove gradients/soft shadows/extra accents, uppercase display headings.
   - Add `tileUrl` + `tileAttribution` support to the fly-over map card/view.
   - Each module's `src/index.css` imports the theme package and keeps `@source` for shared code.
4. Run each package's Vitest suite, typecheck, lint, build `dist-lib`, and Storybook smoke check.
5. Release via changesets: theme package `0.1.0`, each widget package a minor bump; record new
   versions for the dashboard.

### Workstream B — Dashboard (this repo, after A publishes)

1. **Test-first**: write failing tests for `useTheme` resolution/persistence/media changes, token
   contrast/token completeness, the raw-palette guard, and Playwright theme expectations.
2. Add the `@sousa99/homesweethome-theme` dependency and import its CSS in `src/index.css` (loaded
   last by `src/main.tsx`, after widget styles); update `src/index.css` with semantic tokens for
   shell/body/phone header.
3. Add the inline boot script + critical background in `index.html` so the stored/system appearance
   is applied before first paint; avoid flash on hard reload.
4. Implement `src/theme/useTheme.ts` and `ThemeControl` (System/Light/Dark segmented control,
   accessible names, persisted key, cross-tab `storage` sync, `matchMedia` listener only while in
   System mode).
5. Restyle host-owned UI: `App` loading shell, `DashboardGrid` headings, `DateReadout`,
   `WeatherBlock`, `StatusBlock`, `PlaceholderBlock`, and all block wrappers. Remove hardcoded
   amber/slate/hex values.
6. Add `flights.tileUrls` + `tileAttribution` to `config.ts`/`public/config.json` with OSM light and
   Esri World Dark Gray dark defaults; pass the active basemap from `FlightMapBlock`.
7. Wire the new widget versions into `package.json` + `pnpm-lock.yaml`, update `docs/versions.md` and
   `README` theme notes.
8. Verify: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`,
   and `docker compose up -d --build` smoke.

### Rollout & compatibility

- Ship the theme package first, then widgets. With no `data-theme` attribute, widgets default to the
  light identity, so the modules can release before the dashboard lands.
- The dashboard pins each module independently (constitution); mismatched widgets still render but
  may keep legacy styling until bumped. `docs/versions.md` is updated in the same change.
- No changes to `/api/<module>` proxies, nginx, or backend images.

## Complexity Tracking

> No constitution violations. Cross-repo coordination is required by the feature (published widget
> packages), not an architectural exception.
