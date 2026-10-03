# Dashboard configuration reference

The dashboard reads `public/config.json` at runtime and deep-merges it over the built-in defaults
(`src/config.ts`). Every block is optional — omitted keys keep the defaults.

## Top-level shape

```jsonc
{
  "clock": { "defaultFormat": "24h", "switchable": false },
  "bus": { "stops": [/* BusStopConfig[] */] },
  "flights": {
    "location": { "lat": 0, "lng": 0, "radiusKm": 100 },
    "autoRefresh": 30,
    "maxResults": 5,
  },
  "tasks": { "filters": {}, "refreshRateMs": 30000, "autoRotateMs": 4000 },
  "status": { "intervalMs": 30000 },
  "placeholders": [/* { title, description }[] */],
}
```

## clock

| Key             | Default | Description                                                               |
| --------------- | ------- | ------------------------------------------------------------------------- |
| `defaultFormat` | `"24h"` | `"12h"` or `"24h"`.                                                       |
| `switchable`    | `false` | Show the 12h/24h toggle (persists to localStorage). Off for a wall clock. |

## bus

| Key     | Default | Description                                                          |
| ------- | ------- | -------------------------------------------------------------------- |
| `stops` | `[]`    | Array of stop cards to render (empty → "No stops configured" panel). |

Each stop:

| Key                 | Default      | Description                                                       |
| ------------------- | ------------ | ----------------------------------------------------------------- |
| `id`                | — (required) | Stop identifier used by the bus-catcher API (`/stops/:id/times`). |
| `name`              | — (required) | Display name shown in the card header.                            |
| `lines`             | `[]`         | Bus short names to show; empty = all lines.                       |
| `limit`             | `5`          | Max departures listed (1–20).                                     |
| `refetchIntervalMs` | `15000`      | Polling interval; `0` disables polling.                           |

## flights

| Key           | Default                     | Description                                                  |
| ------------- | --------------------------- | ------------------------------------------------------------ |
| `location`    | Lisbon (`38.7223, -9.1393`) | `{ lat, lng, radiusKm }` centre of the fly-over query.       |
| `autoRefresh` | `30`                        | Refresh rate: `"off"` or `5`, `10`, `30`, `60` (seconds).    |
| `maxResults`  | `5`                         | Max aircraft in the list (closest first); the map shows all. |

## tasks

| Key             | Default | Description                                                   |
| --------------- | ------- | ------------------------------------------------------------- |
| `filters`       | `{}`    | `TaskFilters` for the deck (e.g. `{ "status": "to-start" }`). |
| `refreshRateMs` | `30000` | Polling interval for the task list.                           |
| `autoRotateMs`  | `4000`  | Deck auto-rotation delay; `0` disables rotation.              |

## status

| Key          | Default | Description                                               |
| ------------ | ------- | --------------------------------------------------------- |
| `intervalMs` | `30000` | How often the status strip re-checks the module backends. |

The strip probes each module through the same `/api/<module>` proxies used by the widgets:

- **bus** — `/api/bus/api/health` (200 = up)
- **tasks** — `/api/tasks/health` (200 = up)
- **flights** — `/api/fly/api/fly-overs?lat=0&lng=0&radiusKm=1` (200 = up)

A 5xx or network failure marks the module as offline.

## placeholders

An array of `{ title, description }` "coming soon" tiles rendered in the bottom row. Add future
modules here (or replace the tile with a real widget when one ships).
