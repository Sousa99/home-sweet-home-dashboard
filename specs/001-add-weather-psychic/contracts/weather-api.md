# Contracts: Weather-Psychic Integration

**Branch**: `001-add-weather-psychic` | **Date**: 2026-10-04 | **Spec**: [spec.md](../spec.md)

## 1. Same-origin proxy contract

The dashboard hands the weather widgets a per-module `baseUrl` of `/api/weather`. Widgets build
requests like `/api/weather/api/...`; the proxy strips the `/api/weather` prefix and forwards the
remainder to `weather-psychic-backend:3000` (which routes under `/api`).

**Must stay in sync** — both sides of the contract are updated together:

| Side            | Location                                   | Entry                                                           |
| --------------- | ------------------------------------------ | --------------------------------------------------------------- |
| SPA baseUrl     | `src/layout/DashboardGrid.tsx` `BASE_URLS` | `weather: '/api/weather'`                                       |
| Container proxy | `deploy/nginx.conf`                        | `location /api/weather/` → `weather-psychic-backend:3000`       |
| Dev proxy       | `vite.config.ts`                           | `/api/weather` → `http://localhost:3103`, rewrite strips prefix |
| Dev compose     | `docker-compose.dev.yml`                   | `weather-psychic-backend` ports `3103:3000`                     |

## 2. REST endpoints (back-end routes reachable through the proxy)

All mounted under `/api` on the backend; through the proxy they appear under `/api/weather/api`.

### `GET /api/weather/api/health`

Health probe used by the dashboard status panel.

- **Response 200**: `{ "ok": true, "service": "weather-psychic" }`

### `GET /api/weather/api/weather?lat=<num>&lng=<num>`

Single forecast payload for a coordinate (WGS84).

- **Query**: `lat` (-90..90), `lng` (-180..180).
- **Response 200**: `Forecast`
  ```json
  {
    "location": {
      "id": 1,
      "name": "Camarate",
      "latitude": 38.72,
      "longitude": -9.14,
      "timezone": "Europe/Lisbon"
    },
    "current": {
      "time": "...",
      "temperature": 19.4,
      "apparentTemperature": 19.1,
      "weatherCode": 2,
      "condition": "Partly cloudy",
      "humidity": 64,
      "windSpeed": 12.3,
      "windDirection": 210,
      "precipitationProbability": 10,
      "uvIndex": 3,
      "isDay": true
    },
    "hourly": [
      {
        "time": "...",
        "temperature": 19.0,
        "weatherCode": 2,
        "condition": "Partly cloudy",
        "precipitationProbability": 10,
        "isDay": true
      }
    ],
    "daily": [
      {
        "date": "2026-10-05",
        "weatherCode": 3,
        "condition": "Overcast",
        "temperatureMin": 14.2,
        "temperatureMax": 21.8,
        "precipitationProbability": 30
      }
    ],
    "generatedAt": "2026-10-04T12:00:00Z"
  }
  ```
- **Error 400**: invalid query (`{ "success": false, "message": "...", "errors": [...] }`).

### `GET /api/weather/api/locations/search?query=<string>`

Geocoding search (not used by the dashboard widgets; listed for completeness of the MCP parity).

- **Query**: `query` min 2 chars.
- **Response 200**: `{ "results": [ WeatherLocation, ... ] }`

## 3. MCP server contract

- **Server name**: `weather-psychic` (version `0.1.0`), streamable HTTP at `/mcp` on `:3001`.
- **Compose**: `weather-psychic-mcp` service from `ghcr.io/sousa99/weather-psychic-backend:0.1.0`,
  command `node dist/index.js --mcp`, host port `3203:3001` (env `HSH_WEATHER_PSYCHIC_MCP_PORT`).
- **opencode.json entry** (new):
  ```json
  {
    "weather-psychic": { "type": "remote", "url": "http://localhost:3203/mcp", "enabled": true }
  }
  ```
- **Tools** (identical schemas to the REST endpoints):
  - `weather.get_forecast` — `{ lat, lng }` → `Forecast`
  - `weather.search` — `{ query }` → `{ results }`

## 4. Widget contract (host → widget props)

Hosted by `WeatherBlock` in the dashboard grid; both widgets self-fetch and honor `baseUrl`.

| Widget               | Required props              | Optional props                                         |
| -------------------- | --------------------------- | ------------------------------------------------------ |
| `CurrentWeatherCard` | `location: WeatherLocation` | `baseUrl`, `refetchIntervalMs`, `className`            |
| `DailyForecastCard`  | `location: WeatherLocation` | `baseUrl`, `refetchIntervalMs`, `maxDays`, `className` |

- Both receive `location={config.weather.location}` and `baseUrl={BASE_URLS.weather}`.
- `DailyForecastCard` additionally receives `maxDays={config.weather.maxDays}`.
