# Phase 0 Research: Dashboard Visual Identity Refresh

All Technical Context unknowns are resolved. No `NEEDS CLARIFICATION` items remain.

## R1 — How to theme independently published widgets consistently

**Decision**: Introduce one published semantic-token package, `@sousa99/homesweethome-theme`
(v0.1.0), in the modules monorepo. All five widget frontends and the dashboard consume the same
`theme.css` and semantic utility classes.

**Rationale**: The widgets currently use raw Tailwind palette utilities (`bg-white`, `text-slate-*`,
`border-amber-*`, `rounded-*`, `shadow-sm`). Approximately 300 occurrences exist across the five
frontends. Matching styling, simplification, and future theme changes require one source of truth.
The constitution forbids config/design drift and keeps module source out of the dashboard repo.

**Alternatives considered**:

- _Dashboard-only palette remap_ (override `--color-slate-*`, `--color-amber-*`, `--color-white` per
  theme): quick, but cannot deliver square corners, thick outlines, hard shadows, uppercase display
  type, or widget simplification; brittle against any widget class change.
- _Duplicate token CSS in the dashboard and each module_: guarantees drift.
- _Theme-by-props on every widget_: too many props, and raw utility classes remain hardcoded.

## R2 — Tailwind v4 token integration pattern

**Decision**: In `@sousa99/homesweethome-theme/theme.css`:

1. Define raw values as `--hsh-*` custom properties under `:root, [data-theme='light']` and
   `[data-theme='dark']`, setting `color-scheme`.
2. Map them to Tailwind theme variables with `@theme inline`
   (`--color-surface: var(--hsh-surface)`, `--color-ink`, `--color-ink-muted`, `--color-accent`,
   `--color-accent-ink`, `--color-outline`, `--color-ok`, etc.).
3. Expose shape/type tokens (`--font-display`, `--radius-brutal`, `--shadow-brutal`).
4. Provide a small set of `@utility` / `.hsh-*` primitives for repeated surface, heading, button,
   badge, input, and focus-ring patterns.

`@theme inline` makes generated utilities resolve through the raw variables at runtime, so adding
`data-theme='dark'` rethemes every compiled class without rebuilding CSS. Each module's
`src/index.css` imports `tailwindcss` then the theme package; shared `@source` entries stay intact.

**Rationale**: This is the documented Tailwind v4 pattern for runtime light/dark tokens and works with
each package's standalone `tailwindcss -i src/index.css -o dist-lib/styles.css` build.

**Alternatives considered**: `dark:` variants on every utility (duplicated, error-prone across five
repos); CSS-in-JS (new dependency, not part of the stack); per-theme stylesheet swaps (flash, extra
requests, widget CSS already global).

## R3 — Neo-brutalist token values (approved mockup)

**Decision**: Use the following token sets. Square corners and thick outlines are expressed in rem so
they scale with the TV root font-size clamp.

| Role                 | Light     | Dark      |
| -------------------- | --------- | --------- |
| `--hsh-bg`           | `#f1eee4` | `#101010` |
| `--hsh-surface`      | `#fffdf6` | `#1a1a1a` |
| `--hsh-surface-alt`  | `#f7f3e8` | `#222222` |
| `--hsh-ink`          | `#111111` | `#f6f2e7` |
| `--hsh-ink-muted`    | `#4b4b4b` | `#b9b4a8` |
| `--hsh-accent`       | `#ff5a36` | `#c8ff3d` |
| `--hsh-accent-ink`   | `#111111` | `#111111` |
| `--hsh-outline`      | `#111111` | `#f6f2e7` |
| `--hsh-shadow-color` | `#111111` | `#000000` |
| `--hsh-ok`           | `#0a7a3d` | `#8ce99a` |
| `--hsh-warn`         | `#8a4a00` | `#ffd43b` |
| `--hsh-error`        | `#b3261e` | `#ff8787` |
| `--hsh-info`         | `#1d4ed8` | `#74c0fc` |
| `--hsh-map-bg`       | `#dce8ff` | `#16200a` |
| `--hsh-map-line`     | `#93a9d6` | `#3c5420` |

Shape/type: `--hsh-radius: 0px`; `--hsh-border-width: 0.1875rem` (3px at 16px root); hard shadow
offset `0.375rem` (6px at 16px root); display/body system sans stacks (no web fonts); display headings
weight 900, uppercase, tight tracking; clock uses `font-variant-numeric: tabular-nums`.

**Rationale**: Matches the user-approved "Neo-Brutalist" mockup (`neo-brutalist.png` in the preview
folder). Each appearance uses exactly one accent (orange in light, acid green in dark), as approved.
Values are deliberately high-contrast; exact ratios are verified by R7 tests.

**Alternatives considered**: single accent shared across both appearances (less faithful to the
approved dark mockup); fixed px borders (do not scale at 4K); downloaded display font (violates the
local-first/system-font preference).

## R4 — Theme preference, control, and no-flash loading

**Decision**:

- Storage key `hsh.dashboard.theme`, values `'light'` or `'dark'`; **absence means System**.
- `document.documentElement.dataset.theme` is the single runtime signal for CSS and map selection.
- An inline script in `index.html` `<head>` reads storage under `try/catch`, falls back to
  `matchMedia('(prefers-color-scheme: dark)')`, and sets `data-theme` before the app paints. A tiny
  critical `<style>` sets the matching page background so a hard reload never flashes the wrong color.
- `useTheme` resolves `system | light | dark`, writes the attribute, persists manual choices, listens
  to `matchMedia` only while in System mode, and syncs across tabs via the `storage` event.
- The control is a three-option segmented control (System / Light / Dark) with `aria-pressed`, lucide
  `Monitor` / `Sun` / `Moon` icons, and accessible labels; it sits in the dashboard header and
  collapses to icons on phone.

**Rationale**: System default satisfies FR-010 without surprising TV users; a 3-way control is
discoverable and allows returning to System. Inline boot script is the only reliable way to meet the
no-flash criterion with a localStorage preference.

**Alternatives considered**: CSS-only `prefers-color-scheme` (no manual override); a two-state toggle
(cannot return to System); a settings drawer (extra complexity for one setting); storing resolved
theme only (loses the System state).

## R5 — Dark basemap for the flight map

**Decision**: Make the basemap configurable as a light/dark pair in `flights.tileLayers`, each with
`url` and `attribution`. Defaults: light = OpenStreetMap standard; dark = Esri World Dark Gray
(`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`). `FlightMapBlock` selects the pair
by resolved appearance. The fly-over map card/view gains a `tileAttribution` prop (defaults to the
existing OSM attribution) so the provider credit stays correct.

**Rationale**: Key-less, no new credentials, widely used, and visually compatible with near-black
surfaces. The existing widget already accepts `tileUrl`; adding `tileAttribution` is a small,
backward-compatible change and part of the planned module release.

**Alternatives considered**: CSS `invert(1) hue-rotate(180deg)` filter on OSM tiles (no provider
change, but muddy labels/colors and still light-branded); paid/keyed providers (new secret and setup
burden); custom vector basemap (out of scope, complex).

## R6 — Widget simplification rules

**Decision**: Every widget follows these rules when refactored:

- Surfaces: `bg-surface` or `bg-surface-alt`, `border-brutal`, `shadow-brutal`, `rounded-none`.
- Text: `text-ink` / `text-ink-muted`; no raw palette classes, no color literals in TSX.
- Accent: only `text-accent` / `bg-accent` (with `text-accent-ink`); exactly one accent per
  appearance.
- Status: `text-ok` / `text-warn` / `text-error` / `text-info` with matching surface variants.
- Headings: `hsh-heading` (uppercase, weight 900, display font); labels use muted small caps.
- Remove `bg-gradient-*`, `from-*`, `to-*`, translucent overlays, `shadow-sm/md/lg`, and decorative
  `rounded-*`; replace with flat fills and the single hard shadow.
- Controls: square, thick outline, hard shadow, visible `focus-visible` ring using the outline token.
- Charts/map elements: tokenized stroke/fill colors; no rainbows.
- Keep behavior, DOM structure (except necessary wrappers), labels, and test IDs unchanged.

**Rationale**: Delivers FR-005 through FR-007/FR-016 and keeps the redesign scannable rather than
noisy. A palette-guard test enforces the rule mechanically.

## R7 — Verification strategy

**Decision**:

1. **Token contract test** (Vitest, dashboard and theme package): parse the published `theme.css`,
   assert both appearances define every required token, and compute WCAG ratios for required pairs
   (`ink`/`bg`, `ink`/`surface`, `ink-muted`/`surface`, `accent-ink`/`accent`, status colors/surface,
   outline/surface, outline/bg). Thresholds: 4.5:1 text, 3:1 non-text.
2. **Palette guard** (Vitest in dashboard; root script in modules): fail if raw palette utilities
   (`bg-slate-*`, `text-amber-*`, `border-rose-*`, `bg-white`, etc.) or hex colors appear in
   component/block source. Allow only token utilities.
3. **Preference unit tests** (`useTheme`): System/Light/Dark resolution, storage read/write, invalid
   storage fallback, media change while in System, no media reaction while manual, cross-tab sync.
4. **Playwright theme matrix**: at phone, tablet, and TV viewports, with `emulateMedia` light/dark and
   with stored overrides, assert `data-theme`, persisted choice after reload, control state, no
   horizontal overflow, and map tile host switching; keep the existing responsive matrix green.
5. **Module checks**: existing Vitest suites plus Storybook theme decorator (toolbar/global to toggle
   light/dark), typecheck, lint, and `dist-lib` build for each package.
6. **Manual visual review** against the approved mockup in both appearances on the TV grid and phone.

**Rationale**: Automated contrast and palette guards make the design rules enforceable; Playwright
covers behavior and layout; no pixel snapshots (cross-platform font rendering is unstable in CI).

**Alternatives considered**: axe-core (catches some contrast but not palette rules or theme toggling;
could be added later); pixel snapshot tests (flaky across OS/fonts); Storybook-only review (not gated).

## R8 — Cross-repo release and version sequencing

**Decision**:

1. Modules: add `packages/theme`, publish `@sousa99/homesweethome-theme@0.1.0`; bump each widget
   package minor (`bus-catcher 0.3.0`, `current-time 0.2.0`, `fly-over-tracker 0.6.0`,
   `procrastinator-tracker 0.3.0`, `weather-psychic 0.2.0`); update changesets and publish.
2. Dashboard: add the theme dependency, bump widget pins to those versions, update `pnpm-lock.yaml`
   and `docs/versions.md` in the same change.
3. Release the theme package before widgets; widgets before the dashboard.

**Rationale**: Widget CSS bundles the tokens at build time, so the theme package must exist first.
Consumers without `data-theme` get the light defaults, making the rollout backward-safe. Minor bumps
are appropriate because the public component APIs are unchanged (except additive map props).

**Alternatives considered**: publish everything at once (order-dependent CI failures); major bumps
(no API break, needless churn); dashboard-first (would briefly render unstyled/mismatched widgets).

## R9 — Out of scope / unaffected

- No changes to backend images, `/api/<module>` proxies, nginx, or Docker networking.
- No layout, block order, data refresh, or interaction behavior changes.
- No new persistence service or cloud sync; the preference is device-local only.
- No custom webfonts or icon set changes (lucide stays).
- No changes to the MCP host ports or the dashboard package identity.
