# Quickstart: Validating the Weather-Psychic Integration

**Branch**: `001-add-weather-psychic` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

End-to-end validation guide for the weather module plus the module updates. Implementation
details live in `tasks.md`; contract details in `contracts/weather-api.md`.

## Prerequisites

- GitHub Packages access (`GH_PACKAGES_TOKEN` in `.env` / `~/.npmrc`) — see `setup.md`.
- Docker + Docker Compose.
- Ports free: `3100–3103` (dev backends), `3200–3203` (MCP), `3304` (dashboard), `5173` (Vite).

## 1. Static quality gates (no backend required)

```bash
pnpm install            # resolves updated + new @sousa99/* packages
pnpm lint && pnpm format && pnpm typecheck
pnpm test               # Vitest: config merge, status probes, grid smoke
```

**Expected**: all green. The grid smoke test renders both weather widgets (mocked) and no longer
shows the "Weather" placeholder.

## 2. Dev-stack validation (containers + Vite proxy)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
pnpm dev
```

**Expected**:
- `docker compose ps` shows `weather-psychic-backend` healthy and `weather-psychic-mcp` up.
- `curl http://localhost:3103/api/health` → `{ "ok": true, "service": "weather-psychic" }`.
- `curl "http://localhost:3103/api/weather?lat=38.72&lng=-9.14"` → a `Forecast` payload with
  `current`, `hourly[]`, `daily[]`.
- Dashboard at `:5173` shows the weather section with current + hourly conditions and the weekly
  forecast for the configured location (replaces the old "Weather" placeholder).

## 3. MCP + opencode validation

```bash
curl -N http://localhost:3203/mcp        # streamable HTTP endpoint responds (protocol handshake)
```

**Expected**: opencode config loads the `weather-psychic` server
(`opencode.json` → `http://localhost:3203/mcp`); tools `weather.get_forecast` and
`weather.search` are available.

## 4. Production-stack smoke test

```bash
docker compose up -d --build
curl http://localhost:3304/api/weather/api/health   # via nginx proxy
```

**Expected**:
- `curl http://localhost:3304/api/weather/api/health` → health JSON (proves the nginx rewrite).
- Dashboard on `:3304` renders weather; status panel shows **Bus, Tasks, Flights, Weather** all up.
- Existing modules still render (bus, flights, tasks, clock) at their updated versions.

## 5. Resilience check

```bash
docker compose stop weather-psychic-backend
```

**Expected**: status panel shows Weather down; the rest of the dashboard stays fully functional;
weather cards surface their error/unavailable state.

## Cross-references

- Contract details: `contracts/weather-api.md`
- Config/data shapes: `data-model.md`
- Version pins: `docs/versions.md`, `.env.example`