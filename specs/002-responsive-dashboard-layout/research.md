# Phase 0 Research: Responsive Multi-Device Dashboard Layout

**Feature**: `002-responsive-dashboard-layout` | **Date**: 2026-10-31

All unknowns from Technical Context are resolved here. No `NEEDS CLARIFICATION` markers remain.

## R1. Viewport classes and breakpoints

**Decision**: Four classes resolved from the usable viewport:

| Class     | Rule                                                              | Rationale                                                                                               |
| --------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `phone`   | width < 640 px, **or** landscape orientation with height < 440 px | Covers 320–639 px portrait phones, foldables, and rotated phones whose width lands in the tablet range. |
| `tablet`  | 640 px ≤ width < 1024 px and not landscape-phone                  | Covers common 768–1023 px tablets and tablet split-screen.                                              |
| `desktop` | 1024 px ≤ width < 1920 px                                         | Laptops and desktop monitors where the current multi-column layout fits.                                |
| `tv`      | width ≥ 1920 px                                                   | Wall displays; preserves the current three-column, non-scrolling presentation.                          |

**Rationale**: The thresholds align with Tailwind's default `sm` (640 px) and `lg` (1024 px)
breakpoints already present in the widget packages, plus the 1920 px full-HD boundary that defines
the TV experience. Viewport size, not user agent, is used so browser resizing, zoom, and split-screen
behave consistently.

**Alternatives considered**: device/user-agent detection (fragile, wrong under browser zoom and
responsive-design mode); three classes only (no distinct tablet arrangement); `matchMedia`
height-only rules (misses portrait phones).

## R2. Layout switching strategy

**Decision**: Hybrid, single DOM tree. CSS media/data-attribute rules define the arrangement; a
`useViewportClass` hook resolves the class with `window.matchMedia`, sets `data-viewport` on
`<html>` and the shell, and drives config-based ordering, compact props, and the compact status
variant. No block is unmounted when the class changes.

**Rationale**: A single DOM preserves widget fetch state and rotation position across resize and
rotation (FR-009) and avoids duplicated component trees. CSS handles arrangement cheaply; the hook
handles the parts CSS cannot (runtime order, prop-level compaction, testable classification).
`useLayoutEffect` applies the attribute before paint to avoid a flash of the wrong layout.

**Alternatives considered**:

- Separate `PhoneLayout`/`TabletLayout`/`TVLayout` components — remounts widgets, loses state,
  duplicates markup, and risks divergent behavior.
- Pure CSS with no JS — cannot honor configurable block order or compact widget props.
- Server-side/UA-based routing — not applicable to a static SPA and inaccurate.

## R3. Scroll policy

**Decision**: `tv` and `desktop` keep `height: 100dvh` and `overflow: hidden`. `phone` and
`tablet` use `min-height: 100dvh` with page-level vertical scrolling; horizontal page scrolling is
forbidden everywhere. The existing internal scrolling inside widgets (weather hourly strip, flight
list, bus card list) remains and is the only permitted horizontal scroll, since it is
widget-internal.

**Rationale**: Satisfies FR-002/FR-003/FR-005 while honoring the TV guideline. `dvh` avoids mobile
browser URL-bar overflow. The feature spec explicitly permits vertical scrolling on small screens.

**Alternatives considered**: keep `overflow: hidden` everywhere (impossible to reach all blocks);
carousel/tab navigation on phones (hides information behind interaction and conflicts with the
"glanceable" goal); one giant scaled-down grid (unreadable text, violates FR-010).

## R4. Root typography and compact sizing

**Decision**: Keep the TV clamp `clamp(14px, 0.75vw, 36px)` for `desktop`/`tv`. For `phone` and
`tablet`, override the root to `16px` so widget `text-sm`/`text-xs` remain legible. Phone compact
sizes: header ~3.5rem tall, bus card capped at the first two departures per stop, weather block
~17rem tall, task deck ~12rem, map deferred to the end, status reduced to one line. Tablet keeps
full widget sizing with extra vertical room.

**Rationale**: The current 0.75vw clamp yields the 14 px floor on phones; widget text scales down
with it and becomes small but technically readable. A 16 px floor restores standard mobile
legibility without changing desktop/TV. Fixed compact heights are needed because the published
widgets require a bounded flex/grid parent (weather and task deck use `h-full` / `--deck-height`).

**Alternatives considered**: scale the whole phone UI down (unreadable); fork widgets to add compact
variants (out of scope and violates Dashboard-First); fluid `clamp()` heights on phone (unpredictable
first-screen fit for SC-002).

## R5. Phone information architecture and the "Now" summary

**Decision**: Phone single column order:
`header (clock + date)` → `bus` (compact) → `weather` (compact) → `tasks` (compact) → `flights`
list → `map` (deferred) → `status` (compact). The first four form the "Now" area and are sized to fit
the first screenful on a 390×844 device. The existing widgets are reused once each — no duplicate
data fetching and no new summary API.

**Rationale**: Reuses the exact widgets the user already sees on TV, so no new backend contract is
introduced and data stays consistent. Ordering comes from `layout.phoneOrder`, so households can
promote flights or demote bus.

**Alternatives considered**: a new hand-built summary fetching module APIs directly (duplicate
requests, diverges from widgets, violates config-first reuse); a dedicated compact widget package
(upstream release work, out of scope).

## R6. Tablet arrangement

**Decision**: Two columns with full-width header and status:
left = flights closest panel + flight map; right = weather, tasks, bus. Both columns scroll with the
page; blocks keep readable heights instead of being squeezed.

**Rationale**: Mirrors the TV grouping (flights together, household tasks/bus/weather together) so
the mental model carries over, while fitting 768–1023 px widths.

**Alternatives considered**: phone single column (wastes tablet width); TV three columns (too narrow,
causes clipped widgets and unreadable text).

## R7. Config-driven priority and visibility

**Decision**: Extend `DashboardConfig` with:

```ts
type BlockId = 'weather' | 'bus' | 'tasks' | 'flights' | 'map' | 'status';

interface LayoutConfig {
  phoneOrder: BlockId[];
  hiddenOnPhone: BlockId[];
  hiddenOnTablet: BlockId[];
}
```

Defaults: `phoneOrder = ['bus','weather','tasks','flights','map','status']`, both hidden lists empty.
`loadConfig` keeps deep-merging; a new `resolveLayout` sanitizes unknown/duplicate ids and falls back
to defaults when an override leaves out required blocks. Desktop/TV order and visibility stay fixed
to preserve the TV experience.

**Rationale**: Meets FR-016 with minimal surface area and follows the "config first" repo
convention. Arrays replace wholesale (existing merge semantics), which is the expected behavior for
an ordered list.

**Alternatives considered**: per-class visibility for all four classes (unnecessary for desktop/TV,
risks accidental TV regressions); CSS-only order (cannot read config); a separate config file (extra
fetch, violates the single runtime config).

## R8. Safe areas and device chrome

**Decision**: Apply `env(safe-area-inset-*)` padding to the shell and use `100dvh` for height.
Include `viewport-fit=cover` in `index.html`. Compact header is sticky only on phone/tablet.

**Rationale**: Prevents notches, rounded corners, and home indicators from covering the clock or
status on iOS/Android; `dvh` avoids content hidden behind mobile browser toolbars.

**Alternatives considered**: fixed `100vh` (URL-bar overflow on mobile); no sticky header (clock
scrolls away, losing the glanceable time requirement).

## R9. Reduced motion

**Decision**: Keep the existing widget motion behavior; ensure any new reveal/collapse affordance is
CSS-only and wrapped in `@media (prefers-reduced-motion: reduce)` to disable transitions. No new
JS animation.

**Rationale**: Satisfies FR-018 without touching widget internals.

**Alternatives considered**: disabling widget rotation on mobile (changes data exposure and is not
required by the spec).

## R10. Testing strategy

**Decision**:

1. Unit tests for `resolveViewportClass(width, height)` covering all classes and landscape phones.
2. Unit tests for `resolveLayout` covering defaults, custom order, hidden blocks, unknown ids, and
   fallback.
3. Config tests for `layout` deep-merge and array replacement.
4. `DashboardGrid` render tests using a mocked `matchMedia` for each class, asserting layout
   attribute, block order, compact status, and preserved widget presence.
5. Playwright + headless Chromium for the real layout matrix (320–3840 px), using deterministic API
   and map-tile mocks. The suite asserts horizontal overflow, block bounds, the phone first
   screenful, touch targets, and captures screenshots for visual review.
6. Manual viewport verification per `quickstart.md` for device chrome and real-backend checks.

**Rationale**: Vitest + jsdom cannot measure layout, scrollbars, or clipping, so a browser is
required to validate the actual requirement. Playwright adds a browser binary and CI time, but the
first run caught real defects (clipped weather details and a vertically oversized phone summary)
that jsdom could not see. Mocks keep the suite deterministic and backend-free.

**Alternatives considered**: manual checks only (violates Test-First and misses regressions);
Puppeteer (no built-in viewport projects/web-server runner); system Chrome only (less portable in
CI).

## R11. TV regression protection

**Decision**: Desktop/TV grid classes, block order, heights, and overflow remain byte-for-byte
equivalent in intent; only the wrapper gains `data-viewport`. A render test asserts the TV
arrangement (three equal columns), and the quickstart includes 1920×1080 and 3840×2160 checks
against the pre-change release.

**Rationale**: The TV is the primary use case (Constitution I) and US2 is P1. Guarding it explicitly
prevents "responsive" work from degrading the wall display.

**Alternatives considered**: visual regression tooling (not present in repo); code comments only
(not verifiable).
