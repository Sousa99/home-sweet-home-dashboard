# Phase 1 Data Model: Responsive Multi-Device Dashboard Layout

**Feature**: `002-responsive-dashboard-layout` | **Date**: 2026-10-31

This feature adds no persisted entities and no backend data. The "model" is the runtime layout
configuration and the derived layout plan used to render the shell.

## Entity: BlockId

A stable identifier for a dashboard block.

**Allowed values**: `weather`, `bus`, `tasks`, `flights`, `map`, `status`

**Notes**: The clock/date header is not orderable; it is always the first region.

**Validation**:

- Only the allowed values are accepted.
- Unknown ids are dropped.
- Duplicates are removed (first occurrence wins).

## Entity: LayoutConfig

User-supplied runtime configuration (from `public/config.json`, typed in `src/config.ts`).

| Field            | Type        | Default                                              | Rule                                                                                                                                                  |
| ---------------- | ----------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phoneOrder`     | `BlockId[]` | `['bus','weather','tasks','flights','map','status']` | Defines phone block order after the header. Missing blocks are appended in default order.                                                             |
| `hiddenOnPhone`  | `BlockId[]` | `[]`                                                 | Blocks omitted on phone. `status` may be hidden; `bus`, `weather`, `tasks`, `flights` may be hidden but the glanceable area then degrades gracefully. |
| `hiddenOnTablet` | `BlockId[]` | `[]`                                                 | Blocks omitted on tablet.                                                                                                                             |

**Relationships**: One `LayoutConfig` per dashboard; it is a child of `DashboardConfig` under the
`layout` key. It merges over defaults through the existing deep-merge loader; arrays replace
wholesale.

**Validation**:

- Non-array values are ignored and defaults used.
- Unknown/duplicate ids are dropped.
- If every block would be hidden, the hidden list is ignored and defaults apply (prevents an empty
  dashboard).
- Desktop and TV ignore `phoneOrder`/hidden lists so the TV experience cannot change.

## Entity: ViewportClass

A derived, non-persisted classification of the current usable viewport.

| Value     | Width rule   | Additional rule                                |
| --------- | ------------ | ---------------------------------------------- |
| `phone`   | < 640 px     | Also when landscape and height < 440 px        |
| `tablet`  | 640–1023 px  | Excluded when the landscape-phone rule matches |
| `desktop` | 1024–1919 px | —                                              |
| `tv`      | ≥ 1920 px    | —                                              |

**Source of truth**: `resolveViewportClass(width, height, isLandscape)` pure function, wrapped by
`useViewportClass()` which subscribes to `matchMedia` and updates on resize/orientation change.

**State transition**: Any class may transition to any other class at runtime on resize or rotation.
No block is unmounted; widget state (loaded data, rotation index, refresh timers) is preserved.

## Entity: LayoutPlan

The resolved, per-class instructions consumed by `DashboardGrid`.

| Field           | Type            | Description                                                                                            |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| `viewportClass` | `ViewportClass` | Active class.                                                                                          |
| `order`         | `BlockId[]`     | Render order for phone (from config); fixed for tablet and irrelevant for desktop/TV (CSS grid areas). |
| `hidden`        | `Set<BlockId>`  | Blocks not rendered for the active class.                                                              |
| `scroll`        | `boolean`       | True for `phone`/`tablet`; false for `desktop`/`tv`.                                                   |
| `compact`       | `boolean`       | True for `phone`; drives compact ATS (bus limit, weather height, task deck height, status variant).    |

**Derivation** (`resolveLayout(layoutConfig, viewportClass)`):

1. If class is `desktop` or `tv`: `order = DEFAULT_ORDER`, `hidden = {}`, `scroll = false`,
   `compact = false`. TV/desktop are authoritative and ignore user order/hiding.
2. If `phone`: sanitize `phoneOrder`; append any missing blocks in default order; `hidden` from
   `hiddenOnPhone`; `scroll = true`; `compact = true`.
3. If `tablet`: `order = TABLET_ORDER`; `hidden` from `hiddenOnTablet`; `scroll = true`;
   `compact = false`.

## Entity: CompactPresentation

Per-block presentation hints used only when `LayoutPlan.compact` is true. These are props/classes,
not persisted data.

| Block     | Compact behavior                                                                        |
| --------- | --------------------------------------------------------------------------------------- |
| `bus`     | Each stop card shows at most 2 departures.                                              |
| `weather` | Block height ~17rem (bounded parent required by widget).                                |
| `tasks`   | Deck height ~12rem.                                                                     |
| `flights` | Natural height; list remains scrollable inside the widget.                              |
| `map`     | Rendered last (deferred) but still mounted to preserve data.                            |
| `status`  | One-line summary (overall online/offline + last checked); full detail via title/expand. |

## Entity: StatusSummary (derived, phone only)

| Field         | Type             | Derived from                 |
| ------------- | ---------------- | ---------------------------- |
| `allUp`       | `boolean`        | Every `ModuleStatus.up`      |
| `downCount`   | `number`         | Count of `!up`               |
| `lastChecked` | `number \| null` | Existing `StatusBlock` state |

**Validation**: With zero statuses (still checking), show a neutral "Checking…" state, not "offline".
