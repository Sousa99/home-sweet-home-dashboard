# Phase 0 Research: Update the Flight-Scanner Version

The feature spec contained no `[NEEDS CLARIFICATION]` markers. The decisions below resolve the
open technical questions that the planning phase must settle.

## Decision 1: Target release is 0.5.0

**Decision**: Update the flight-scanner (fly-over-tracker) module to **0.5.0** — the latest
published release.

**Rationale**: The module repository's `main` is at a release commit and its changelog lists
`0.5.0` as the newest entry for both `@sousa99/fly-over-tracker-components` and
`@sousa99/fly-over-tracker-backend`. The release pipeline publishes both the components package
(to GitHub Packages) and the backend/frontend GHCR images at the module version, so `0.5.0` is
available for both knobs.

**Alternatives considered**:

- _Stay on the current widget pin (`^0.4.2`) and only refresh the backend_ — rejected: the request
  is to move the flight-scanner version forward, and the widget is the user-visible part.
- _Jump to a hypothetical newer version_ — rejected: 0.5.0 is the latest published release.

## Decision 2: Bump the widget package and the backend image together

**Decision**: Move both the `@sousa99/fly-over-tracker-components` dependency and the
`HSH_FLY_OVER_TRACKER_BACKEND_VERSION` default/override to `0.5.0`.

**Rationale**: The module's backend and components packages form a fixed changeset group and
always version together; `docs/versions.md` presents the module as two independently pinned knobs.
Aligning both removes the existing drift (widget `0.4.2` vs backend `0.3.0`) and matches the
module's release model. The backend has had no functional changes since `0.3.0` (its `0.4.x`/`0.5.0`
changelog entries are empty), so the bump is behaviorally safe.

**Alternatives considered**:

- _Widget-only bump_ — viable but leaves the module visibly mismatched and the documentation
  confusing; rejected in favour of alignment.
- _Backend-only bump_ — rejected: does not deliver the requested widget update.

## Decision 3: Keep the caret range for the widget; pin the backend default exactly

**Decision**: Declare the widget as `"@sousa99/fly-over-tracker-components": "^0.5.0"` and set the
backend default to `0.5.0`.

**Rationale**: Matches the repository convention (`docs/versions.md` "Notes"): caret ranges for
the `@sousa99/*` widget packages, exact tags for backend images. Keeps the ecosystem-wide pattern
intact (Constitution III — no per-repo drift).

**Alternatives considered**:

- _Exact widget pin_ — rejected: inconsistent with the other three modules and with the documented
  convention; not required for this feature.

## Decision 4: No runtime configuration or proxy changes

**Decision**: Do not touch `public/config.json`, `src/`, `deploy/nginx.conf`, or `vite.config.ts`.

**Rationale**: The `0.5.0` changelog entry is additive UI behavior only (smooth auto-scroll of the
closest-flights list); it introduces no new props, no endpoint changes, and no breaking changes.
The widget continues to call the same `/api/fly/api/fly-overs` path through the existing
`/api/fly` proxy, so the nginx/Vite proxy contract is unaffected.

**Alternatives considered**:

- _Add a config toggle for the auto-scroll_ — rejected: out of scope; the release enables it
  automatically and honors `prefers-reduced-motion`.

## Decision 5: Regenerate the lockfile; guard declarations with a test

**Decision**: Regenerate `pnpm-lock.yaml` with `pnpm install` so a frozen CI install succeeds, and
add a Vitest contract test that asserts the declared flight-scanner versions are consistent across
`package.json`, `docker-compose.yml`, `.env.example`, and `docs/versions.md`.

**Rationale**: CI runs `pnpm install --frozen-lockfile`; a stale lockfile fails the build. A
pin-contract test satisfies Constitution IV (test-first) and V (contract testing) for a change
that otherwise has no unit-testable logic — it fails before the bump and passes after.

**Alternatives considered**:

- _Rely on the existing dashboard smoke test only_ — rejected: it mocks the widget package and
  cannot detect a stale or mismatched declaration.

## Open Questions

None. All planning unknowns are resolved.
