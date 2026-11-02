# Phase 1 Data Model: Dashboard Visual Identity Refresh

This feature has no database entities. The "data model" describes the theme contract, the local
preference, the resolved appearance, and the configuration additions consumed by the UI.

## 1. ThemePreference (persisted, local)

The user's saved choice. Absence of the key means System.

| Field       | Type                          | Rules                                                               |
| ----------- | ----------------------------- | ------------------------------------------------------------------- |
| `key`       | string (constant)             | `hsh.dashboard.theme`                                               |
| `value`     | `'light' \| 'dark' \| absent` | Only these serialized values are accepted; anything else → `absent` |
| `source`    | `'storage' \| 'system'`       | Derived at read time; `system` when the key is absent or unreadable |
| `updatedAt` | not persisted                 | —                                                                   |

**Validation**

- Reads are wrapped so quarantined/blocked storage (private mode, quota, disabled) falls back to
  System without throwing.
- Writes are best-effort; a failed write never breaks the UI or leaves `data-theme` unset.
- The preference is device-local; it is never sent to a backend.

**State transitions**

```text
System --user picks Light--> Light
System --user picks Dark--> Dark
Light  --user picks System--> System
Dark   --user picks System--> System
Light  --user picks Dark--> Dark
Dark   --user picks Light--> Light
System --OS preference changes--> System (resolved appearance may flip)
Light|Dark --OS preference changes--> unchanged (manual choice wins)
```

## 2. ResolvedAppearance (runtime)

The concrete appearance currently rendered.

| Field           | Type                | Derivation                                                             |
| --------------- | ------------------- | ---------------------------------------------------------------------- |
| `preference`    | `ThemePreference`   | See above                                                              |
| `systemPrefers` | `'light' \| 'dark'` | `matchMedia('(prefers-color-scheme: dark)')`, default light if unknown |
| `resolved`      | `'light' \| 'dark'` | `preference === 'system' ? systemPrefers : preference`                 |
| `attribute`     | string              | Mirrors `resolved` on `<html data-theme>`                              |

**Invariants**

- Exactly one resolved appearance exists at any time.
- The `data-theme` attribute and the resolved appearance never disagree after mount.
- The attribute is set before first paint by the inline boot script using the same derivation rules.
- The resolved appearance is the sole selector for the flight basemap and for all CSS tokens.

## 3. ThemeTokens (shared visual contract)

Required token groups, defined once in `@sousa99/homesweethome-theme` and consumed by CSS utilities.
Each token MUST exist for both appearances.

| Group         | Tokens                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Surfaces      | `--hsh-bg`, `--hsh-surface`, `--hsh-surface-alt`                                                   |
| Ink           | `--hsh-ink`, `--hsh-ink-muted`                                                                     |
| Accent        | `--hsh-accent`, `--hsh-accent-ink`                                                                 |
| Outline/shape | `--hsh-outline`, `--hsh-shadow-color`, `--hsh-radius`, `--hsh-border-width`, `--hsh-shadow-offset` |
| Status        | `--hsh-ok`, `--hsh-warn`, `--hsh-error`, `--hsh-info`                                              |
| Map           | `--hsh-map-bg`, `--hsh-map-line`                                                                   |
| Type          | `--hsh-font-display`, `--hsh-font-body`                                                            |

**Validation**

- Both `:root, [data-theme='light']` and `[data-theme='dark']` define every token.
- Contrast pairs: `ink`/`bg` and `ink`/`surface` ≥ 4.5:1; `ink-muted`/`surface` ≥ 4.5:1;
  `accent-ink`/`accent` ≥ 4.5:1; each status color/surface ≥ 4.5:1 when used for text and ≥ 3:1 when
  used as a graphic; `outline`/`surface` and `outline`/`bg` ≥ 3:1.
- Exactly one accent value per appearance; no other accent-like hues in widget source.
- Shape tokens resolve to 0 radius and a single border/shadow style.

## 4. Appearance selector (DOM contract)

| Aspect        | Contract                                                                   |
| ------------- | -------------------------------------------------------------------------- |
| Attribute     | `data-theme="light" \| "dark"` on `<html>`                                 |
| Color scheme  | `color-scheme: light` / `dark` emitted by the theme CSS                    |
| Initial paint | Inline boot script + critical background style prevent a wrong-theme flash |
| Propagation   | Every widget is themed via inherited CSS variables; no per-widget JS       |
| Cross-tab     | `storage` events re-resolve the appearance in other tabs                   |

## 5. WidgetThemeConsumption (module contract)

Rules every widget package must satisfy (enforced by the palette guard and code review).

| Rule          | Requirement                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Colors        | Only semantic utilities (`bg-surface`, `text-ink`, `border-outline`, `text-accent`, etc.)          |
| Forbidden     | Raw palette utilities (`bg-slate-*`, `text-amber-*`, `bg-white`, `border-rose-*`, …), hex literals |
| Shape         | `rounded-none`, the single `border-brutal` style, the single `shadow-brutal` style                 |
| Type          | `hsh-heading` for display headings; body/ink tokens for text                                       |
| Accent budget | At most one accent role per appearance                                                             |
| Status        | Only `ok` / `warn` / `error` / `info` tokens                                                       |
| Motion        | Respects `prefers-reduced-motion`; no decorative animations added by the refresh                   |
| Behavior      | DOM semantics, test IDs, labels, and interactions unchanged                                        |

## 6. TileLayerOption (new config entity)

Added under `flights.tileLayers` so the map basemap is configuration-first.

| Field               | Type   | Validation                                          |
| ------------------- | ------ | --------------------------------------------------- |
| `light.url`         | string | Absolute `https` URL containing `{z}`, `{x}`, `{y}` |
| `light.attribution` | string | Non-empty HTML attribution; rendered by Leaflet     |
| `dark.url`          | string | Same rules as light                                 |
| `dark.attribution`  | string | Same rules as light                                 |

**Defaults**

- Light: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, OSM attribution.
- Dark: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, OSM light + Esri attribution.

**Relationships**

- A `ResolvedAppearance` selects exactly one `TileLayerOption`.
- `FlightsConfig` carries the pair; `FlightMapBlock` forwards the selected `url` and `attribution`
  to the fly-over map card.

## 7. ThemeControl (UI state)

| Field      | Type                            | Notes                                      |
| ---------- | ------------------------------- | ------------------------------------------ |
| `selected` | `'system' \| 'light' \| 'dark'` | Reflects the persisted preference          |
| `resolved` | `'light' \| 'dark'`             | Exposed for icon emphasis/accessible label |
| `options`  | 3 fixed options                 | System, Light, Dark — all always rendered  |

**Validation / accessibility**

- Each option is a real `<button>` with `aria-pressed` and a visible/accessible label.
- Keyboard operable with a visible focus ring; touch targets meet the existing 44px phone rule.
- Choosing an option applies immediately and persists; choosing System follows the media query.
