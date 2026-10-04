# Data Model: Add Weather-Psychic Module & Update All Modules

**Branch**: `001-add-weather-psychic` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

## Entities

### WeatherLocation

The place the weather is fetched for. The dashboard config carries one; both weather widgets
receive it and self-fetch the forecast for its coordinates.

| Field       | Type               | Required | Notes                      |
| ----------- | ------------------ | -------- | -------------------------- |
| `id`        | number             | yes      | Stable geocoding id        |
| `name`      | string             | yes      | Display name               |
| `latitude`  | number (-90..90)   | yes      | WGS84                      |
| `longitude` | number (-180..180) | yes      | WGS84                      |
| `timezone`  | string             | yes      | e.g. `Europe/Lisbon`       |
| `country`   | string             | no       | Display only               |
| `admin1`    | string             | no       | Region/state, display only |

**Validation rules**: latitude/longitude bounds as above; `name` and `timezone` non-empty.
Supplied via `public/config.json` under `weather.location` with a Lisbon-area default.

### WeatherConfig

Runtime dashboard config for the weather block (extends the typed `DashboardConfig` in
`src/config.ts`, merged over defaults by `loadConfig`).

| Field               | Type            | Default             | Notes                             |
| ------------------- | --------------- | ------------------- | --------------------------------- |
| `location`          | WeatherLocation | Lisbon-area default | Shared by both widgets            |
| `refetchIntervalMs` | number          | 900000              | `0` disables auto-refresh         |
| `maxDays`           | number          | 5                   | Days shown in the weekly forecast |

### Forecast (module payload, read-only to the dashboard)

Returned by `GET /api/weather?lat=&lng=`; the widgets render it without the dashboard storing it.

| Field         | Type            | Notes                                |
| ------------- | --------------- | ------------------------------------ |
| `location`    | WeatherLocation | Echo of the queried place            |
| `current`     | CurrentWeather  | Current conditions snapshot          |
| `hourly`      | HourlyEntry[]   | Coming hours (current hour excluded) |
| `daily`       | DailyEntry[]    | Upcoming days (today excluded)       |
| `generatedAt` | string          | ISO timestamp                        |

**CurrentWeather**: `time`, `temperature`, `apparentTemperature`, `weatherCode`, `condition`,
`humidity`, `windSpeed`, `windDirection`, `precipitationProbability`, `uvIndex`, `isDay`.

**HourlyEntry**: `time`, `temperature`, `weatherCode`, `condition`,
`precipitationProbability`, `isDay`.

**DailyEntry**: `date`, `weatherCode`, `condition`, `temperatureMin`, `temperatureMax`,
`precipitationProbability`.

### Module (operational entity)

The set of independently published backend/widget pairs. Adding weather extends this set:

| Module key | Label   | Proxy baseUrl     | Backend image                          | MCP host port |
| ---------- | ------- | ----------------- | -------------------------------------- | ------------- |
| `bus`      | Bus     | `/api/bus`        | `bus-catcher-backend:0.1.3`            | 3200          |
| `fly`      | Flights | `/api/fly`        | `fly-over-tracker-backend:0.4.3`       | 3201          |
| `tasks`    | Tasks   | `/api/tasks`      | `procrastinator-tracker-backend:0.2.0` | 3202          |
| `weather`  | Weather | `/api/weather`    | `weather-psychic-backend:0.1.0`        | 3203          |
| `clock`    | Clock   | — (frontend only) | —                                      | —             |

## State transitions

The weather module is stateless. The only stateful concern is the dashboard status probe:

```
weather backend unreachable ──probe 2xx-4xx──▶ up
        ▲                                              │
        └────────────── probe timeout/5xx ◀─────────────┘
```

No persistence, no local cache; widgets keep last-known data in memory only while the backend is
reachable.
