# Home Sweet Home — Dashboard

A single, standalone **TV / large-screen dashboard** that brings together the Home Sweet Home
modules. It embeds the **published** widget packages (`@sousa99/*-components`) and launches the
module backends from their **published** GHCR images, so this repository stays small and needs no
module source.

```
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ Home Sweet Home · Saturday, 28 September 2026 │  Clock                                        │
├────────────────────┬──────────────────────────┴───────────────────────────────────────────────┤
│ Flights            │  Flights                                                                │
│ Closest + list (5) │  Flight map (FlyOverMapCard)                                            │
│ ────────────────── │  ──────────────────────────────────────────────────────────────         │
│ Weather            │                                                                          │
│ current + hourly   │  Tasks (auto-rotating deck)                                             │
│ ────────────────── │  ───────────────────────────────────────────────────────────────      │
│                    │  Bus (StopCard × N)                                                     │
├────────────────────┴───────────────────────────────────────────────────────────────────────┤
│ System ● Bus ● Tasks ● Flights ······ Checked 12:04:32                                     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

## What's on screen

| Block                    | Widget                                  | Module package                               |
| ------------------------ | --------------------------------------- | -------------------------------------------- |
| Clock                    | `ClockCard`                             | `@sousa99/current-time-components`           |
| Flights — closest + list | `FlyOverClosestPanel` (`maxResults`)    | `@sousa99/fly-over-tracker-components`       |
| Flights — map            | `FlyOverMapCard`                        | `@sousa99/fly-over-tracker-components`       |
| Tasks                    | `TaskDeckWrapper`                       | `@sousa99/procrastinator-tracker-components` |
| Bus stops                | `StopCard` × N (configured stops)       | `@sousa99/bus-catcher-components`            |
| Weather                  | `CurrentWeatherCard` (current + hourly) | `@sousa99/weather-psychic-components`        |
| Status strip             | health probes per module                | — (dashboard)                                |

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
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d   # backends on :3100/:3101/:3102/:3103
pnpm dev                                                            # Vite on :5173
```

The Vite dev proxy mirrors `deploy/nginx.conf`: `/api/bus`, `/api/tasks`, `/api/fly` and
`/api/weather` are forwarded to the corresponding backend with the module prefix stripped.

## Configuration

All block behavior lives in [`public/config.json`](public/config.json). See
[`docs/configuration.md`](docs/configuration.md) for the full reference.

```jsonc
{
  "clock": { "defaultFormat": "24h", "switchable": false },
  "bus": {
    "stops": [{ "id": "376204", "name": "Rua Ivone Silva Frente 10", "lines": ["2711:0"] }],
  },
  "flights": {
    "location": { "lat": 38.804428, "lng": -9.123621, "radiusKm": 4 },
    "autoRefresh": 20,
    "maxResults": 5,
  },
  "tasks": {
    "filters": { "finished": false },
    "refreshRateMs": 30000,
    "autoRotateMs": 4000,
  },
  "status": { "intervalMs": 30000 },
  "weather": {
    "location": {
      "id": 1,
      "name": "Camarate",
      "latitude": 38.804428,
      "longitude": -9.123621,
      "timezone": "Europe/Lisbon",
      "country": "Portugal",
    },
    "refetchIntervalMs": 900000,
  },
  "placeholders": [],
}
```

## MCP servers

`docker compose` also runs each module's MCP server (streamable HTTP at `/mcp`), and
[`opencode.json`](opencode.json) connects opencode to them:

| Module                 | MCP URL                     |
| ---------------------- | --------------------------- |
| bus-catcher            | `http://localhost:3200/mcp` |
| fly-over-tracker       | `http://localhost:3201/mcp` |
| procrastinator-tracker | `http://localhost:3202/mcp` |
| weather-psychic        | `http://localhost:3203/mcp` |

Ports are overridable via `HSH_*_MCP_PORT`. The procrastinator MCP is a **single-session** server
(one client per container lifetime) — restart its container to reconnect.

## How the widgets reach the backends

Each widget is given a same-origin `baseUrl` (`/api/bus`, `/api/tasks`, `/api/fly`,
`/api/weather`). The widget clients append their module-relative paths (`/api/stops/…`,
`/api/tasks`, `/api/fly-overs`, `/api/weather`), so a request lands on `/api/<module>/api/…`.
`deploy/nginx.conf` (and the Vite dev proxy) strips the `/api/<module>` prefix and forwards the
remainder to the module backend on the compose network — no CORS, no host-port exposure needed.

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
