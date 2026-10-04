# Setup

## Prerequisites

- Node 24, pnpm 11
- Docker with Compose v2
- A GitHub account with access to the `@sousa99` packages (GitHub Packages)

## GitHub Packages access (required)

The dashboard depends on the published `@sousa99/*-components` packages and the
`@sousa99/homesweethome-config` presets, which live on GitHub Packages
(`https://npm.pkg.github.com`), not the public npm registry. The `current-time-components`
package is published with restricted access, so installs **require** an auth token.

1. Create a personal access token (classic or fine-grained) with **`read:packages`** scope at
   <https://github.com/settings/tokens>.
2. Put it in your user-level `~/.npmrc` (used by every local install):

   ```ini
   //npm.pkg.github.com/:_authToken=ghp_xxxx
   ```

3. For CI and Docker builds, configure the repository secret **`GH_PACKAGES_TOKEN`** (Actions →
   Secrets). The Dockerfile mounts it as the `npm_token` build secret.

Without the token, `pnpm install` fails on the restricted package. All other setup assumes the
token is available.

## Local install

```bash
pnpm install
```

## Run the dashboard with Docker

```bash
export GH_PACKAGES_TOKEN=ghp_xxxx   # required to build the dashboard image
docker compose up -d --build        # builds the dashboard + pulls the backend images
open http://localhost:3304          # HSH_DASHBOARD_PORT to change the port
```

Backend SQLite databases are created under `./data/` (bus-catcher and procrastinator-tracker;
fly-over-tracker and weather-psychic are stateless).

> The published backend images are **linux/amd64 only**, so on arm64 hosts (e.g. Apple Silicon)
> they run under emulation. `HSH_BACKEND_PLATFORM` (default `linux/amd64`) controls this.

### First run

- **Bus** starts with an empty schedule database. Trigger a one-off GTFS ingest (takes a few
  minutes) so departures appear:

  ```bash
  curl -X POST http://localhost:3304/api/bus/api/refresh
  ```

  Then add stops under `bus.stops` in `public/config.json`.

- **Tasks** starts empty — create tasks via the module's API/SPA, or just watch the deck fill.
- **Flights** uses the live adsb.lol feed — no setup needed.
- **Weather** uses the keyless Open-Meteo provider — no API key or setup needed. Set the location
  under `weather.location` in `public/config.json` (`HSH_WEATHER_PSYCHIC_BACKEND_VERSION` /
  `HSH_WEATHER_PSYCHIC_MCP_PORT` in `.env` override the backend image tag and MCP host port).

## Develop against the live backends

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d   # backends on :3100/:3101/:3102/:3103
pnpm dev
```

## Configure the dashboard

Edit `public/config.json` (see README). The dashboard reads it at runtime; refresh the page to
apply changes.

## Publish

`pnpm version patch` (bump `package.json`), commit, push to `main`. The `release` workflow builds
and pushes `ghcr.io/sousa99/home-sweet-home-dashboard:<version>` and `:latest`. Requires the
`GH_PACKAGES_TOKEN` secret.
