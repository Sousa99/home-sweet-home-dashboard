# Home Sweet Home — Dashboard

A single, standalone **TV / large-screen dashboard** that brings together the Home Sweet Home
modules. It embeds the **published** widget packages (`@sousa99/*-components`) and launches the
module backends from their **published** GHCR images, so this repository stays small and needs no
module source.

```
┌──────────────────────────────┬────────────────────────────────┬─────────────────┐
│ Home Sweet Home              │                                │  Clock          │
│ Saturday, 28 September 2026  │                                │                 │
├──────────────────────────────┤   Flights (map, hero)          ├─────────────────┤
│  Bus                         │   Closest aircraft             │  Tasks          │
│  StopCard 1                  │                                │  (auto-rotating │
│  StopCard 2                  │                                │   deck)         │
├──────────────────────────────┴────────────────────────────────┴─────────────────┤
│ Placeholder (Weather)  │  Placeholder (Energy)  │  Placeholder (Media)          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ System ● Bus ● Tasks ● Flights ······ Checked 12:04:32                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## What's on screen

| Block        | Widget                                  | Module package                               |
| ------------ | --------------------------------------- | -------------------------------------------- |
| Clock        | `ClockCard`                             | `@sousa99/current-time-components`           |
| Bus stops    | `StopCard` × N (configured stops)       | `@sousa99/bus-catcher-components`            |
| Flights      | `FlyOverWidget` + `ClosestAircraftCard` | `@sousa99/fly-over-tracker-components`       |
| Tasks        | `TaskDeckWrapper`                       | `@sousa99/procrastinator-tracker-components` |
| Status strip | health probes per module                | — (dashboard)                                |
| Placeholders | "coming soon" tiles for future modules  | — (dashboard)                                |

The grid is **rem-based** (root font-size scales with viewport width) and scroll-free, so it
renders well from 720p up to 4K.

## Quick start

```bash
pnpm install
export GH_PACKAGES_TOKEN=ghp_xxxx   # required to build the dashboard image
docker compose up -d --build        # backends (GHCR images) + dashboard on http://localhost:3304
```

Backend databases persist in `./data/`. Set `HSH_DASHBOARD_PORT` in `.env` to change the
dashboard port. See [`setup.md`](setup.md) for the first-run data steps (bus GTFS ingest) and the
arm64 emulation note.

### Development

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d   # backends on :3100/:3101/:3102
pnpm dev                                                            # Vite on :5173
```

The Vite dev proxy mirrors `deploy/nginx.conf`: `/api/bus`, `/api/tasks` and `/api/fly` are
forwarded to the corresponding backend with the module prefix stripped.

## Configuration

All block behavior lives in [`public/config.json`](public/config.json). See
[`docs/configuration.md`](docs/configuration.md) for the full reference.

```jsonc
{
  "clock": { "defaultFormat": "24h", "switchable": false },
  "bus": {
    "stops": [
      {
        "id": "1001",
        "name": "Casal do Canas",
        "lines": ["3715"],
        "limit": 5,
        "refetchIntervalMs": 15000,
      },
    ],
  },
  "flights": {
    "location": { "lat": 38.7223, "lng": -9.1393, "radiusKm": 100 },
    "autoRefresh": 30,
  },
  "tasks": {
    "filters": { "status": "to-start" },
    "refreshRateMs": 30000,
    "autoRotateMs": 4000,
  },
  "status": { "intervalMs": 30000 },
  "placeholders": [{ "title": "Weather", "description": "…" }],
}
```

## How the widgets reach the backends

Each widget is given a same-origin `baseUrl` (`/api/bus`, `/api/tasks`, `/api/fly`). The widget
clients append their module-relative paths (`/api/stops/…`, `/api/tasks`, `/api/fly-overs`), so a
request lands on `/api/<module>/api/…`. `deploy/nginx.conf` (and the Vite dev proxy) strips the
`/api/<module>` prefix and forwards the remainder to the module backend on the compose network —
no CORS, no host-port exposure needed.

## Module versions

Each module is pinned independently — its `@sousa99/<slug>-components` dependency in
`package.json` and its backend image tag (`HSH_<SLUG>_BACKEND_VERSION` in `.env`) are separate
knobs. See [`docs/versions.md`](docs/versions.md) for the table and the per-module upgrade
workflow.

## Quality gates

`pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` must all pass (enforced in
CI, see `AGENTS.md`).

## Release

Pushing to `main` builds and pushes
`ghcr.io/sousa99/home-sweet-home-dashboard:<version>` + `:latest` (version from `package.json`).
See [`setup.md`](setup.md) for the `GH_PACKAGES_TOKEN` requirement.
