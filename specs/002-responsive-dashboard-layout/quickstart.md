# Quickstart Validation: Responsive Multi-Device Dashboard Layout

**Feature**: `002-responsive-dashboard-layout`

Use this guide to verify the feature end-to-end. It is a run/validation guide, not an
implementation checklist; see [plan.md](./plan.md), [data-model.md](./data-model.md), and
[contracts/layout-contract.md](./contracts/layout-contract.md) for design details.

## Prerequisites

- Node 24+ and `pnpm` installed.
- GitHub Packages access configured (see `setup.md`) so `pnpm install` can resolve
  `@sousa99/*-components`.
- Optional but recommended: module backends running so blocks show live data.

```bash
pnpm install
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d   # backends on 3100–3103
pnpm dev                                                               # http://localhost:5173
```

If you only need layout verification, the dashboard still lays out correctly with empty/loading
blocks and offline errors.

## Automated checks

```bash
pnpm test          # Vitest: viewport classification, layout resolution, config merge, shell render
pnpm test:e2e      # Playwright: real 320–3840 px layout matrix + screenshots (API mocks)
pnpm typecheck
pnpm lint
pnpm format
pnpm build
```

The first e2e run needs a browser: `pnpm exec playwright install chromium`. The suite starts Vite
automatically, mocks every module API and map tile, and writes screenshots to `test-results/` (one
per viewport plus the expanded-weather state).

Expected: all pass. The shell render tests mock `matchMedia` for each viewport class and assert the
`data-viewport` attribute, block presence/order, compact status on phone, and the non-scrolling
desktop/TV arrangement.

## Manual viewport scenarios

Use browser devtools responsive mode. Check after each change that **no horizontal page scrollbar**
appears (the page's `scrollWidth` equals `clientWidth`) and no block is clipped.

### 1. Phone portrait — 390×844 (P1)

1. Load the dashboard at 390×844.
2. Expected:
   - Time and date visible at the top.
   - "Now" area shows the next bus departure(s), current weather (with hourly strip), and the task
     deck within the first screenful, in the configured order.
   - Duration/status line is a single compact row.
   - Scrolling down reaches flights list, flight map, and compact status.
   - The hourly weather strip scrolls horizontally by touch without moving the page horizontally.
3. Remeasure at 320×568: content reflows, text remains legible, nothing clips horizontally.

### 2. Phone landscape — 844×390

1. Rotate to landscape.
2. Expected: still the phone (single-column, scrollable) arrangement, not the tablet two-column
   layout; header remains compact and reachable; no reload needed.

### 3. Tablet portrait — 768×1024

1. Load at 768×1024.
2. Expected: two columns; flights (closest + map) in the left column; weather, tasks, and bus in the
   right; header and status span the full width; page scrolls vertically only.

### 4. Tablet landscape — 1024×768

1. Load at 1024×768.
2. Expected: desktop/laptop multi-column arrangement (or the two-column tablet arrangement if the
   class boundary is configured at 1024); all blocks visible without clipping; no horizontal
   scrolling.

### 5. Desktop — 1440×900

1. Load at 1440×900.
2. Expected: existing multi-column arrangement, all blocks visible without page scrolling.

### 6. TV regression — 1920×1080 and 3840×2160 (P1)

1. Load at 1920×1080, then 3840×2160.
2. Expected: the current release layout — header row, three equal main columns, full status footer,
   everything visible with no scrolling. Compare side-by-side with the pre-change build.

### 7. Live resize and rotation (P3)

1. Start at 390×844 and resize the window continuously to 1920×1080, then back down.
2. Expected: layout switches at class boundaries without reload; no horizontal scrollbar; task deck
   rotation and loaded data survive the transitions; returning to TV restores the non-scrolling
   layout.

### 8. Browser zoom — 200% at 1440×900

1. Set zoom to 200%. Effective width becomes ~720 px.
2. Expected: tablet arrangement, readable text, no horizontal scrolling.

## Configuration scenarios

Edit `public/config.json`, reload, and confirm the layout responds without a rebuild.

1. **Custom phone order**

   ```json
   { "layout": { "phoneOrder": ["weather", "bus", "tasks", "flights", "map", "status"] } }
   ```

   Expected: weather appears before bus on phone; desktop/TV unchanged.

2. **Hide the map on phone**

   ```json
   { "layout": { "hiddenOnPhone": ["map"] } }
   ```

   Expected: no map block on phone; tablet and TV still show it.

3. **Invalid values**

   ```json
   { "layout": { "phoneOrder": ["nope", "bus", "bus"], "hiddenOnPhone": "map" } }
   ```

   Expected: unknown/duplicate ids dropped, non-array ignored, defaults applied for missing blocks;
   the dashboard still renders.

4. **Missing `layout` section** — defaults apply.

## Accessibility and device chrome checks

1. Enable OS reduced motion, reload, and confirm new dashboard transitions are disabled.
2. In devtools, emulate a notched device (for example iPhone 14 Pro) and confirm the clock and
   status are not obscured.
3. On phone, tab through the page: focus order matches visual order; the compact status exposes the
   per-module state to assistive technology (not color alone).
4. Measure a few interactive controls on phone/tablet; targets should be at least 44×44 CSS px.

## Expected outcomes summary

| Check                               | Expected                            |
| ----------------------------------- | ----------------------------------- |
| Horizontal page scroll, 320–3840 px | Never                               |
| Phone first screenful               | Time, bus, weather, tasks           |
| TV at 1920/3840                     | Unchanged, non-scrolling            |
| Resize/rotation                     | Reflows, no reload, state preserved |
| Config order/hide on phone          | Applied; TV/desktop unaffected      |
