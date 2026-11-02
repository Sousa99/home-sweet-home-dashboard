# Module versions

Each Home Sweet Home module is consumed by the dashboard as **two independent knobs**:

| Module                 | Frontend (npm package)                                           | Backend (GHCR image tag)                                                                       |
| ---------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| bus-catcher            | `@sousa99/bus-catcher-components` (in `package.json`)            | `ghcr.io/sousa99/bus-catcher-backend:${HSH_BUS_CATCHER_BACKEND_VERSION}`                       |
| fly-over-tracker       | `@sousa99/fly-over-tracker-components` (in `package.json`)       | `ghcr.io/sousa99/fly-over-tracker-backend:${HSH_FLY_OVER_TRACKER_BACKEND_VERSION}`             |
| procrastinator-tracker | `@sousa99/procrastinator-tracker-components` (in `package.json`) | `ghcr.io/sousa99/procrastinator-tracker-backend:${HSH_PROCRASTINATOR_TRACKER_BACKEND_VERSION}` |
| current-time           | `@sousa99/current-time-components` (in `package.json`)           | — (frontend-only module)                                                                       |
| weather-psychic        | `@sousa99/weather-psychic-components` (in `package.json`)        | `ghcr.io/sousa99/weather-psychic-backend:${HSH_WEATHER_PSYCHIC_BACKEND_VERSION}`               |

## Current pins

| Module                 | Components | Backend image |
| ---------------------- | ---------- | ------------- |
| bus-catcher            | `^0.3.0`   | `0.3.0`       |
| fly-over-tracker       | `^0.6.0`   | `0.6.0`       |
| procrastinator-tracker | `^0.3.0`   | `0.3.0`       |
| current-time           | `^0.2.0`   | —             |
| weather-psychic        | `^0.2.0`   | `0.2.0`       |

Shared theme package: `@sousa99/homesweethome-theme` `^0.1.0` (consumed by the dashboard and every
widget; not tied to a single module release).

## Upgrading one module (example: bus-catcher → 0.3.0)

1. **Frontend** — in `package.json`, set `"@sousa99/bus-catcher-components": "^0.3.0"`, then `pnpm install`.
2. **Backend** — in `.env`, set `HSH_BUS_CATCHER_BACKEND_VERSION=0.3.0`, then
   `docker compose up -d`.
3. The other three modules are untouched — their pins and tags stay where they are.

## Notes

- In the modules monorepo a module's `-backend` and `-components` packages **version
  together** (fixed changeset group), but here they are independent: you _can_ run frontend
  `0.1.0` against backend `0.2.0` — API compatibility across a mismatch is on you.
- Caret ranges (`^0.1.0`) allow `pnpm install` to resolve newer `0.1.x` patches/minors. Switch
  any entry to an exact `0.1.0` pin for a fully reproducible build of that module.
- Shared runtime deps (react, react-dom, lucide-react, leaflet, motion) stay single-version in
  the app; only the `@sousa99/*` packages are independently pinned.
