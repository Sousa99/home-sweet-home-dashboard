# Contract: Widget & Host Theme Consumption

**Applies to**: all five widget frontends in `home-sweet-home-modules`, the shared
`packages/components` package, and the dashboard's host-owned blocks.

## 1. Dependency and import rules

Each module frontend:

- Adds `@sousa99/homesweethome-theme` as a dependency (`workspace:*` during development).
- Imports it in `src/index.css` after Tailwind:

  ```css
  @import 'tailwindcss';
  @import '@sousa99/homesweethome-theme/theme.css';
  @source "../../../../packages/components/src";
  ```

- Keeps its existing `build:css` script and `./styles.css` export unchanged.
- Does **not** ship its own palette overrides, `dark:` variants, or a second theme block.

The dashboard imports `@sousa99/homesweethome-theme/theme.css` in `src/index.css`, which `src/main.tsx`
loads after the widget stylesheets, so the dashboard's tokens remain authoritative for the host DOM.

## 2. Class mapping (required)

| Instead of                                               | Use                                            |
| -------------------------------------------------------- | ---------------------------------------------- |
| `bg-white`, `bg-slate-50`, `bg-slate-100`                | `bg-surface`, `bg-surface-alt`                 |
| `text-slate-700`, `text-slate-800`, `text-slate-900`     | `text-ink`                                     |
| `text-slate-400`, `text-slate-500`, `text-slate-600`     | `text-ink-muted`                               |
| `border-slate-200`, `border-slate-300`, `border-amber-*` | `border-outline`                               |
| `text-amber-600`, `bg-amber-500`, `text-amber-800`       | `text-accent`, `bg-accent`, `text-accent-ink`  |
| `text-emerald-*`, `bg-emerald-*`                         | `text-ok` / `bg-ok`                            |
| `text-red-*`, `bg-red-*`, `text-rose-*`                  | `text-error` / `bg-error`                      |
| `text-sky-*`, `text-blue-*`, `text-indigo-*`             | `text-info` / `bg-info`                        |
| `rounded-*`                                              | `rounded-brutal` (`0`)                         |
| `border` / `border-2` / `border-4`                       | `border-brutal` (single 0.1875rem outline)     |
| `shadow-sm` / `shadow` / `shadow-md` / `shadow-lg`       | `shadow-brutal` (single hard offset)           |
| `bg-gradient-to-*`, `from-*`, `via-*`, `to-*`            | flat `bg-surface` / `bg-surface-alt`           |
| `bg-slate-900/50`, `bg-black/40`                         | solid `bg-surface-alt`                         |
| `text-white` on accent                                   | `text-accent-ink`                              |
| `ring-*`, `outline-amber-*`                              | `ring-outline` / `outline-outline` with offset |

Headings: `font-display uppercase font-black tracking-tight text-ink` (or the shared `.hsh-heading`).
Numerals in the clock/timers: `tabular-nums`.

## 3. Presentation rules

- Exactly one accent per appearance; do not introduce a second highlight hue.
- At most one hard shadow per card; no soft shadows, glows, or blur.
- Square corners everywhere; no pill shapes except where an existing circular status dot is semantic
  (keep the dot circular, make its ring square-free).
- Flat fills only; remove decorative gradients and translucent overlays.
- Keep semantic status dots/labels, but color them with status tokens.
- Preserve text content, labels, ARIA attributes, test IDs, behavior, refresh cadence, and layout
  structure. Simplification is visual, not behavioral.
- Do not add `data-theme`, `dark:` classes, or theme props to widgets; CSS inheritance is the only
  theme channel.
- Motion stays as-is and must continue to honor `prefers-reduced-motion`.

## 4. Forbidden source patterns (CI-enforced)

In `modules/*/frontend/src/**/*.tsx` and `packages/components/src/**/*.tsx`:

- Tailwind palette utilities: `(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-\d{2,3})?`
- Raw color literals in markup: `#rgb`, `#rrggbb`, `rgb(...)`, `hsl(...)`, `oklch(...)`.
- Opacity modifiers on color utilities: `/50`, `/70`, …
- `rounded-(sm|md|lg|xl|2xl|3xl|full)` (except the semantic circular status dot, which uses
  `rounded-full` and is allowlisted by class name).

Exceptions must be listed in the guard script with a comment explaining why; the default is zero
exceptions.

In the dashboard: same rules for `src/**/*.tsx`, with the same status-dot allowlist.

## 5. Map widget additions

`fly-over-tracker` map card/view add:

```ts
interface FlyOverMapCardProps {
  // existing props unchanged …
  /** Optional attribution HTML matching tileUrl; defaults to OpenStreetMap. */
  tileAttribution?: string;
}
```

- `tileAttribution` is rendered by the Leaflet `TileLayer` `attribution` option.
- Default behavior must remain byte-for-byte compatible for existing consumers (OSM URL and
  attribution).
- The dashboard passes the selected `flights.tileLayers` entry's `url` and `attribution`.

## 6. Storybook and tests

- Add a global theme decorator + toolbar toggle (Light/Dark) to each module's Storybook preview so
  reviewers can inspect both appearances.
- Keep all existing Vitest suites green; add/extend tests only where behavior changes (map props).
- Add a package-level palette-guard test or rely on the monorepo root guard script (required in CI).
- Build `dist-lib` and visually check the package's stories in both appearances before release.

## 7. Per-package checklist

| Package                                      | Source to refactor                                                                       | Extra work                                           |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `@sousa99/current-time-components`           | clock display, format toggle                                                             | display numerals, accent on active format            |
| `@sousa99/bus-catcher-components`            | stop cards, departures, line badges, relative times                                      | one accent for line badge                            |
| `@sousa99/weather-psychic-components`        | current conditions, hourly strip, daily forecast, selector                               | condition icons use ink/accent only                  |
| `@sousa99/fly-over-tracker-components`       | closest panel, list, map card, controls                                                  | `tileAttribution` prop, map circle/marker tokens     |
| `@sousa99/procrastinator-tracker-components` | task deck, cards, filters, transitions                                                   | flat card surfaces, status/urgency via status tokens |
| `@sousa99/homesweethome-components`          | `WidgetStatusBar`                                                                        | shared status bar styled once                        |
| dashboard host blocks                        | `App`, `DashboardGrid`, `DateReadout`, `WeatherBlock`, `StatusBlock`, `PlaceholderBlock` | consume tokens; map selection                        |

## 8. Release and pinning

- Publish `@sousa99/homesweethome-theme@0.1.0` first.
- Publish widget minors: bus `0.3.0`, current-time `0.2.0`, fly-over `0.6.0`, procrastinator `0.3.0`,
  weather `0.2.0`.
- Dashboard updates its pins, `pnpm-lock.yaml`, and `docs/versions.md` in the same change.
- Visual changes are minor bumps (no public API breaks; map props are additive and optional).
