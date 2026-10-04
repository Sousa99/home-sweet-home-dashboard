# Research: Add Weather-Psychic Module & Update All Modules

**Branch**: `001-add-weather-psychic` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

## 1. Module version updates (frontend + backend)

Latest published versions verified against the GitHub Packages registry and the
`Sousa99/home-sweet-home-modules` release tags.

| Module | Components pin (now) | Components pin (target) | Backend image (now) | Backend image (target) |
| ------ | -------------------- | ----------------------- | ------------------- | ---------------------- |
| bus-catcher | `^0.1.2` | `^0.1.3` | `0.1.2` | `0.1.3` |
| fly-over-tracker | `^0.4.2` | `^0.4.3` | `0.3.0` | `0.4.3` |
| procrastinator-tracker | `^0.1.2` | `^0.2.0` | `0.1.2` | `0.2.0` |
| current-time | `^0.1.1` | `^0.1.1` (no change) | — | — |
| weather-psychic | — | `^0.1.0` (NEW) | — | `0.1.0` (NEW) |

- **Decision**: Bump the four component packages in `package.json` and the three existing backend
  env tags in `.env.example`/`docker-compose.yml` defaults; add weather-psychic as the fifth.
- **Rationale**: These are the newest published versions on `npm.pkg.github.com` and
  `ghcr.io/sousa99` (verified: `bus-catcher-backend:0.1.3`, `fly-over-tracker-backend:0.4.3`,
  `procrastinator-tracker-backend:0.2.0`, `weather-psychic-backend:0.1.0` all exist). Caret ranges
  already resolve these on `pnpm install`; the backend tags are explicit.
- **Alternatives considered**: Leaving modules on current pins — rejected, the feature explicitly
  asks to update all modules.

## 2. Weather-psychic module (package + image + widget surface)

- **Package**: `@sousa99/weather-psychic-components@0.1.0`, exports `CurrentWeatherCard`,
  `DailyForecastCard`, `LocationSelector`, their prop types, and `./styles.css`.
- **Image**: `ghcr.io/sousa99/weather-psychic-backend:0.1.0`, dual-mode entry `--http` (REST on
  `:3000`) / `--mcp` (streamable HTTP on `:3001`). **Stateless** — no DB, no volume, no secret.
  Keyless Open-Meteo provider with an offline `mock` feed.
- **Widget contracts** (both self-fetch, honor `baseUrl`, keep last-known data on error):
  - `CurrentWeatherCard` props: `location: Location` (required), `fetchForecast?`, `baseUrl?`,
    `refetchIntervalMs?` (default 900000), `className?`. Shows current conditions
    (temperature, condition, feels-like, humidity, wind, precip probability, UV) + an
    auto-scrolling hourly strip (reduced-motion aware).
  - `DailyForecastCard` props: `location: Location` (required), `fetchForecast?`, `baseUrl?`,
    `refetchIntervalMs?` (default 900000), `maxDays?` (default 5), `now?`, `className?`. Lists
    upcoming days starting tomorrow (today excluded).
  - `Location` type: `{ id, name, latitude, longitude, timezone, country?, admin1? }`.
- **Decision**: Host both widgets in one `WeatherBlock` passing `config.weather.location` and
  `BASE_URLS.weather`. Import `@sousa99/weather-psychic-components/styles.css` in `src/main.tsx`
  (same pattern as the other four modules).
- **Rationale**: The widgets require a full `Location` object (not bare lat/lng), so the runtime
  config must carry one; the dashboard already pins the home area coordinates.
- **Alternatives considered**: Using `LocationSelector` on the TV dashboard — rejected, it is an
  interactive control and the TV grid is read-only; location comes from config.

## 3. Backend REST contract (what the proxy must expose)

Mounted under `/api` on the backend:

- `GET /api/health` → `{ ok: true, service: 'weather-psychic' }` — used by the dashboard status probe.
- `GET /api/weather?lat=<num>&lng=<num>` → `Forecast` (`location`, `current`, `hourly[]`,
  `daily[]`, `generatedAt`).
- `GET /api/locations/search?query=<min 2 chars>` → `{ results: Location[] }`.

- **Decision**: Dashboard probes `GET /api/weather/api/health` (base-url prefix + backend route),
  mirroring the bus/fly pattern.
- **Rationale**: `checkModule` probes each backend's health endpoint; weather exposes one at
  `/api/health`.
- **Alternatives considered**: Probing `/api/weather/api/weather` — rejected, health endpoint is
  cheaper and has no upstream dependency.

## 4. Proxy + compose + MCP + opencode wiring

Same pattern as the existing modules, weather on the next free ports:

| Concern | Existing (bus/fly/tasks) | Weather (new) |
| ------- | ------------------------ | ------------- |
| SPA baseUrl | `/api/bus`, `/api/fly`, `/api/tasks` | `/api/weather` |
| nginx upstream | `bus-catcher-backend:3000` etc. | `weather-psychic-backend:3000` |
| Vite dev proxy target | `localhost:3100/3101/3102` | `localhost:3103` |
| Compose HTTP service | `*-backend` (PORT 3000) | `weather-psychic-backend` |
| Compose MCP service | `*-mcp` → host `3200/3201/3202` | `weather-psychic-mcp` → host `3203` |
| Dashboard `depends_on` | 3 backends | + `weather-psychic-backend` (healthy) |
| opencode.json MCP | 3 remote entries | + `weather-psychic` → `http://localhost:3203/mcp` |
| Env vars | `HSH_*_BACKEND_VERSION`, `HSH_*_MCP_PORT` | `HSH_WEATHER_PSYCHIC_BACKEND_VERSION`, `HSH_WEATHER_PSYCHIC_MCP_PORT` |

- **Decision**: Add the weather backend service (no volume, healthcheck on `/api/health`),
  the weather MCP service, the dev-port override `3103:3000`, and the opencode.json remote entry.
- **Rationale**: The module is stateless so no volume/migrate step is needed (unlike tasks);
  compose and opencode wiring are mandatory integration touchpoints for the module to be usable.
- **Alternatives considered**: Skipping the MCP service — rejected, every other module exposes one
  and the user explicitly asked to consider opencode.json.

## 5. Status probe + config + tests

- `src/lib/status.ts`: add `'weather'` to `ModuleKey`, label "Weather", probe
  `/api/weather/api/health`.
- `src/config.ts`: add `WeatherConfig { location: WeatherLocation; refetchIntervalMs: number;
  maxDays: number }` with defaults; deep-merge keeps existing override behavior.
- `public/config.json`: add `weather` block with a real `Location` (Lisbon home-area coords);
  remove the "Weather" placeholder entry (keeps "Energy" and "Media").
- Tests: extend `config.test.ts` (weather merge/defaults), `status.test.ts` (weather probe up/down),
  `dashboard.test.tsx` (mock the two weather widgets + status, assert weather block, placeholder
  count 3 → 2).
- **Decision**: Config-first location; defaults fall back to a Lisbon-area `Location` when unset.
- **Rationale**: Follows the constitution's config-first rule and the existing test structure.