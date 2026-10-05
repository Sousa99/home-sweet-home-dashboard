# Quickstart: Update the Flight-Scanner Version

Validation guide for moving the fly-over-tracker ("flight-scanner") module to `0.5.0`. Run from
the repository root.

## Prerequisites

- Node.js >= 24 and pnpm 11.
- GitHub Packages access for `@sousa99/*` packages (see `setup.md`, `.npmrc`).
- For the stack check: Docker with Compose; `GH_PACKAGES_TOKEN` set for the dashboard image build.

## 1. Dependency and lockfile

```bash
pnpm install
```

Expected:

- `pnpm-lock.yaml` resolves `@sousa99/fly-over-tracker-components` to `0.5.0`.
- No other `@sousa99/*` package changes version.

Confirm with a frozen install (what CI runs):

```bash
pnpm install --frozen-lockfile
```

Expected: succeeds with no lockfile-outdated error.

## 2. Version-pin contract test (test-first)

```bash
pnpm test -- tests/versions.test.ts
```

Expected:

- **Before** the declaration bump: fails, naming the location(s) still on a pre-`0.5.0` value.
- **After** the bump: passes — `package.json`, both `docker-compose.yml` image defaults,
  `.env.example`, and `docs/versions.md` all agree on `0.5.0`.

See [contracts/version-declaration.md](./contracts/version-declaration.md) for the exact locations
and invariants.

## 3. Full quality gates

```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Expected: all pass. The build embeds the `0.5.0` widget package without type or CSS-import errors.

## 4. Backend image tag resolution

```bash
docker compose config | grep fly-over-tracker-backend
```

Expected: the resolved image ends in `fly-over-tracker-backend:0.5.0` (unless an operator override
is set via `HSH_FLY_OVER_TRACKER_BACKEND_VERSION`).

## 5. End-to-end stack (optional, needs Docker)

```bash
docker compose up -d
```

Expected:

- `fly-over-tracker-backend` becomes healthy at `0.5.0`.
- The dashboard loads; the flights area (closest-aircraft tile, aircraft list, flight map) renders
  and refreshes.
- The status strip reports the flights module up (probe `/api/fly/api/fly-overs`).

The API/proxy contract is unchanged — see
[contracts/api-compatibility.md](./contracts/api-compatibility.md).

## Out of scope

The other three modules (bus-catcher, procrastinator-tracker, current-time) must remain at their
existing versions throughout.
