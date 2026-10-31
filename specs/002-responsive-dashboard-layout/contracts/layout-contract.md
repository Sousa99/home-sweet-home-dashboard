# UI Contract: Responsive Dashboard Layout

**Feature**: `002-responsive-dashboard-layout`

This is the observable contract for the dashboard shell. It describes what a user and an automated
check should be able to rely on at each viewport class. It does not prescribe internal component
structure.

## Viewport Classes

| Class     | Condition                                         | Page scroll | Block arrangement                                                                                  |
| --------- | ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `phone`   | width < 640 px, or landscape with height < 440 px | Vertical    | One column: header, then configured order (default bus → weather → tasks → flights → map → status) |
| `tablet`  | 640–1023 px, not landscape-phone                  | Vertical    | Two columns, header/status full width; flights left, weather/tasks/bus right                       |
| `desktop` | 1024–1919 px                                      | None        | Existing multi-column arrangement, all blocks visible                                              |
| `tv`      | ≥ 1920 px                                         | None        | Existing three-column arrangement, all blocks visible                                              |

The active class is exposed as `data-viewport="phone|tablet|desktop|tv"` on the dashboard root and
on `<html>`.

## Guarantees (all classes)

1. No page-level horizontal scrolling at any width from 320 px to 3840 px.
2. No block content is clipped by the shell; blocks either fit or the page scrolls (small classes)
   or the block scrolls internally (widget-defined).
3. Every rendered block keeps its existing data source, refresh cadence, and health probing.
4. Resizing or rotating across class boundaries does not reload the page and does not unmount
   blocks.
5. Safe-area insets are respected; no content sits under a notch, rounded corner, or gesture
   indicator.
6. Reduced-motion preference disables any dashboard-level transitions.

## Phone contract

- Header shows time and date in the first screenful.
- The "Now" area (bus, weather, tasks) fits within 844 px of viewport height at 390 px width,
  together with the header, when default config is used.
- Bus cards show at most 2 departures per stop.
- Weather block is approximately 17rem tall; the hourly strip may scroll horizontally by touch
  inside the widget.
- Task deck is approximately 12rem tall and keeps auto-rotation.
- Flight map is rendered after the flight list (deferred), still mounted.
- Status renders as a single line with an overall indicator and last-checked time.

## Tablet contract

- Two columns with a full-width header and status.
- Flight closest panel and map share the left column; weather, tasks, and bus share the right.
- Blocks use full (non-compact) widget sizing.
- The page scrolls vertically; columns are not independently scrollable.

## Desktop / TV contract

- Byte-for-byte visual intent of the current release is preserved: header row, three equal main
  columns (flights closest + weather | flight map | tasks + bus), full status footer.
- `overflow: hidden` on the shell; all blocks visible without scrolling.
- `layout.phoneOrder` and `layout.hiddenOnPhone`/`hiddenOnTablet` have no effect.
- Desktop and TV remain usable with the same refresh behavior as before this feature.

## Config contract

`public/config.json` may include a `layout` object (see
[`layout-config.schema.json`](./layout-config.schema.json)). Omitting it yields the defaults. The
loader never throws; invalid values fall back to defaults. Arrays replace defaults wholesale.

## Accessibility contract

- The shell landmarks remain: `header`, `main`, block `section`s with `aria-label`, `footer` for
  status.
- On phone, the compact status line exposes the full per-module state through an accessible
  name/description; it is not color-only.
- Interactive targets on `phone` and `tablet` are at least 44×44 CSS px.
- The reading order on phone follows the configured visual order.
