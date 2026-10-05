# Feature Specification: Update the Flight-Scanner Version

**Feature Branch**: `001-flight-scanner-version`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "update the flight-scanner version"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Latest flight widgets on the dashboard (Priority: P1)

A household member watches the TV dashboard and sees the flights area (closest aircraft,
aircraft list, and flight map) rendered by the newest released version of the flight-scanner
widgets, including the latest display refinements, with no visible regression to the flights
area.

**Why this priority**: The dashboard's value depends on the embedded flight widgets; bringing
them to the current release is the core of this request.

**Independent Test**: Load the dashboard with the updated widget declaration and confirm the
flights area renders and refreshes as before, now served by the target release.

**Acceptance Scenarios**:

1. **Given** the dashboard is configured with the target flight-scanner widget release, **When**
   the flights area loads, **Then** the closest-aircraft tile, aircraft list, and map render
   without errors and refresh on the configured interval.
2. **Given** the previous flight-scanner release was in use, **When** the dashboard is updated
   to the target release, **Then** no flights-related dashboard configuration change is required
   for it to keep working.

---

### User Story 2 - Aligned flight-scanner backend (Priority: P2)

An operator runs the dashboard stack and the flight-scanner backend service starts from the
same release as the embedded widgets, so the widget and service are not left on mismatched
versions.

**Why this priority**: The module is consumed as two independently pinned knobs (widget package
and backend image); leaving them mismatched is a latent source of confusion and defects.

**Independent Test**: Start the stack with the updated pins and confirm the flight-scanner
backend becomes healthy and serves the flights endpoint used by the dashboard.

**Acceptance Scenarios**:

1. **Given** the updated dashboard declarations, **When** the stack starts, **Then** the
   flight-scanner backend runs at the target release and reports healthy.
2. **Given** an operator sets an explicit backend override, **When** the stack starts, **Then**
   the override is honored and the default is used only when no override is supplied.

---

### User Story 3 - Truthful version documentation (Priority: P3)

A maintainer reads the module version documentation and sees the flight-scanner row matching
what the dashboard actually declares and runs, so future upgrades start from an accurate
baseline.

**Why this priority**: Stale pins in documentation cause repeated confusion and mis-scoped
upgrades; keeping docs truthful is low-effort but high-leverage.

**Independent Test**: Compare the documented flight-scanner pins against the dashboard's
declared widget and backend versions; they match with no stale values.

**Acceptance Scenarios**:

1. **Given** the update is complete, **When** the current-pins documentation is read, **Then**
   the flight-scanner widget and backend versions equal the target release.
2. **Given** the update is complete, **When** other modules' rows are read, **Then** they are
   unchanged.

---

### Edge Cases

- **Target release unavailable**: If the target flight-scanner release cannot be resolved from
  the package registry, the update MUST fail loudly (install/build) rather than silently falling
  back to an older version.
- **Pre-existing newer resolution**: If the declared range already resolves to the target or
  newer, the update MUST still make the declared intent explicit and leave no stale lower bound.
- **Lockfile enforcement**: Continuous integration installs with a frozen lockfile; the lockfile
  MUST be consistent with the updated declarations so frozen installs succeed.
- **Architecture mismatch**: The flight-scanner backend image is published for a single
  architecture; on hosts requiring emulation the stack MUST still start (existing behavior).
- **No configuration migration**: The target release introduces no new widget inputs or endpoint
  changes; existing dashboard configuration MUST continue to load unchanged.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST consume the latest published release of the flight-scanner
  module for its embedded flight widgets (closest-aircraft tile, aircraft list, and flight map).
- **FR-002**: The dashboard MUST run the flight-scanner backend service at the same module
  release as the widgets by default.
- **FR-003**: Every place the dashboard declares a default flight-scanner version MUST be
  updated together so no stale default remains.
- **FR-004**: The dependency lockfile MUST resolve the flight-scanner widget to the target
  release and remain consistent for a frozen install.
- **FR-005**: The module version documentation MUST state the target flight-scanner widget and
  backend versions in its current-pins section.
- **FR-006**: The update MUST NOT change the pins of any other module.
- **FR-007**: Existing flight-scanner dashboard configuration MUST continue to work without
  modification.
- **FR-008**: All existing quality gates (format, lint, typecheck, tests, production build)
  MUST pass after the update.

### Key Entities _(include if feature involves data)_

- **Flight-scanner module release**: The published version of the flight-scanner module,
  currently the latest release; identifies both the widget library and the backend service image.
- **Widget version declaration**: The dashboard's declared dependency on the flight-scanner
  widget library (with a version range and a resolved lockfile entry).
- **Backend image tag declaration**: The dashboard's declared default and overridable tag for the
  flight-scanner backend service image.
- **Current-pins documentation row**: The documented flight-scanner widget and backend versions
  maintained for maintainers.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: After the update, a fresh install resolves the flight-scanner widget to the target
  release with zero unresolved or stale versions reported.
- **SC-002**: The flight-scanner backend service starts and reports healthy at the target release
  when the stack is brought up with defaults.
- **SC-003**: The flights area of the dashboard renders and refreshes with no regressions, and
  the full quality-gate suite passes in a single run.
- **SC-004**: The documented flight-scanner pins match the declared widget and backend versions
  exactly, with zero stale references.
- **SC-005**: The other three modules' declared versions are unchanged (byte-for-byte identical
  to before the update).

## Assumptions

- "Flight-scanner" refers to the dashboard's flights module, which is published as the
  fly-over-tracker module (widget library plus backend service image).
- The target is the latest published module release, **0.5.0**, which is already released and
  available for both the widget library and the backend image.
- The widget library and backend image are updated together to keep the module aligned, matching
  the module's fixed-group release model; the backend release introduces no behavior change
  relative to the previously pinned backend.
- The 0.5.0 release only adds smooth auto-scrolling to the closest-flights list; it introduces no
  new widget inputs, endpoint changes, or breaking changes, so no configuration migration is
  required.
- The existing caret-style version range convention for the widget library is retained, while the
  backend image default is pinned to the target release.
- The other three modules (bus-catcher, procrastinator-tracker, current-time) are explicitly out
  of scope.
