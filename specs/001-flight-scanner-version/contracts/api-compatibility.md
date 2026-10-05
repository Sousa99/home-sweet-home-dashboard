# Contract: Flight-Scanner API Compatibility

**Type**: HTTP/proxy contract between the dashboard and the flight-scanner backend
**Status**: Unchanged by this feature — documented to confirm compatibility of the 0.5.0 bump

## Purpose

Confirm that moving the flight-scanner widget package and backend image to `0.5.0` requires no
change to the dashboard↔backend request contract or the proxy configuration.

## Request contract (unchanged)

| Item               | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Dashboard base URL | `/api/fly` (same-origin)                                       |
| Widget path        | `/api/fly-overs` appended by the widget client                 |
| Effective request  | `/api/fly/api/fly-overs?lat=<lat>&lng=<lng>&radiusKm=<radius>` |
| Health probe       | `/api/fly/api/fly-overs` (used by the status strip)            |

## Proxy contract (unchanged)

| Layer       | Location            | Behavior                                                      |
| ----------- | ------------------- | ------------------------------------------------------------- |
| Production  | `deploy/nginx.conf` | strip `/api/fly` → forward to `fly-over-tracker-backend:3000` |
| Development | `vite.config.ts`    | strip `/api/fly` → forward to `http://localhost:3101`         |

Both layers MUST remain identical in behavior (Constitution V). This feature does not modify
either file.

## Change assessment for 0.5.0

| Aspect                 | Change | Notes                                                       |
| ---------------------- | ------ | ----------------------------------------------------------- |
| Endpoint paths         | None   | No route additions/removals in the 0.5.0 changelog.         |
| Request/response shape | None   | No type or field changes; widget prop surface unchanged.    |
| Widget public props    | None   | `FlyOverClosestPanel` gains internal auto-scroll only.      |
| Backend behavior       | None   | Backend changelog entries `0.4.x`/`0.5.0` are empty.        |
| Configuration schema   | None   | No new config keys; existing `flights` config is untouched. |

## Verification

- Existing `tests/status.test.ts` continues to assert the `/api/fly/api/fly-overs?...` probe path.
- Existing `tests/dashboard.test.tsx` continues to render the mocked fly-over widgets without prop
  changes.
- No proxy edits are expected in the diff; if any become necessary, `deploy/nginx.conf` and
  `vite.config.ts` must be changed together.
