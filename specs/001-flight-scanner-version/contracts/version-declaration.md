# Contract: Flight-Scanner Version Declaration

**Type**: Repository declaration contract (not a network API)
**Applies to**: the fly-over-tracker ("flight-scanner") module only

## Purpose

The dashboard consumes each module through two independently pinned knobs. This contract defines
where the flight-scanner versions are declared and the invariants that keep those declarations
consistent. It is enforced by a Vitest test (`tests/versions.test.ts`).

## Declared locations

| #   | Location                                                                                             | Value form             | Target             |
| --- | ---------------------------------------------------------------------------------------------------- | ---------------------- | ------------------ |
| 1   | `package.json` → `dependencies["@sousa99/fly-over-tracker-components"]`                              | caret range            | `^0.5.0`           |
| 2   | `pnpm-lock.yaml` → resolved `@sousa99/fly-over-tracker-components`                                   | exact resolved version | `0.5.0`            |
| 3   | `docker-compose.yml` → `fly-over-tracker-backend` image `${HSH_FLY_OVER_TRACKER_BACKEND_VERSION:-X}` | default `X`            | `0.5.0`            |
| 4   | `docker-compose.yml` → `fly-over-tracker-mcp` image `${HSH_FLY_OVER_TRACKER_BACKEND_VERSION:-X}`     | default `X`            | `0.5.0`            |
| 5   | `.env.example` → `HSH_FLY_OVER_TRACKER_BACKEND_VERSION`                                              | exact tag              | `0.5.0`            |
| 6   | `docs/versions.md` → current-pins row `fly-over-tracker`                                             | components + backend   | `^0.5.0` / `0.5.0` |

## Invariants

1. **Widget/documentation agreement**: the `package.json` specifier (location 1) equals the
   components pin in `docs/versions.md` (location 6).
2. **Backend agreement**: the compose defaults (locations 3 and 4), the `.env.example` value
   (location 5), and the backend pin in `docs/versions.md` (location 6) all equal the same exact
   tag.
3. **Widget/backend alignment**: the widget specifier's numeric version and the backend tag carry
   the same module version (`0.5.0`).
4. **Other modules untouched**: no other module's declaration changes as part of this feature.

## Contract test expectations

- Fails before the change: at least one declared location still carries a pre-`0.5.0` value.
- Passes after the change: every location resolves to `0.5.0` and the invariants hold.
- The test reads the declaration files as text/JSON; it does not require a running stack or
  network access.

## Compatibility

- The widget package remains a **peer-compatible** dependency for the dashboard's React 19 /
  leaflet 1.9 / react-leaflet 5 runtime; `0.5.0` declares the same peer ranges as `0.4.2`.
- The backend image tag is a drop-in replacement for the previously pinned tag; no env var name or
  port changes.
