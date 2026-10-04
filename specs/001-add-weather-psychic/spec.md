# Feature Specification: Add Weather-Psychic Module & Update All Modules

**Feature Branch**: `feature/001-add-weather-psychic`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "open a feature branch and update all the modules. also introduce the weather-psychic module, i want to display both the component with the current + hourly weather and also the weekly weather forecast."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Current & Hourly Weather (Priority: P1)

As a household member, I glance at the dashboard and instantly see the current outdoor conditions
(temperature, condition, feels-like, humidity, wind, precipitation probability, UV) for my home
area, plus the coming hours in an auto-scrolling strip so I can decide whether I need a jacket or
an umbrella before stepping out.

**Why this priority**: Live current conditions are the most frequently consulted weather
information and are visible on-screen immediately without any interaction. It is the primary
reason the weather module is added.

**Independent Test**: Can be fully tested by rendering the dashboard with a configured weather
location and confirming the current-conditions card shows real values for the location, with the
hourly strip advancing on its own (respecting reduced-motion preferences).

**Acceptance Scenarios**:

1. **Given** a configured weather location, **When** the dashboard loads, **Then** the current
   conditions (temperature, condition, feels-like, humidity, wind, precipitation probability, UV)
   are displayed for that location.
2. **Given** the current-conditions card is visible, **When** time passes, **Then** the coming
   hours advance in the hourly strip without user interaction.
3. **Given** the dashboard has reduced-motion enabled, **When** the hourly strip renders, **Then**
   it does not auto-scroll.

---

### User Story 2 - View the Weekly Weather Forecast (Priority: P1)

As a household member, I look at the dashboard and see the weather outlook for the upcoming days
(tomorrow onward) — day, condition, and low/high temperature — so I can plan the week at a glance
without opening another app.

**Why this priority**: The weekly outlook is the second half of "what's the weather now and what's
coming". It is independently valuable and required by the feature description alongside the
current + hourly view.

**Independent Test**: Can be fully tested by rendering the weekly forecast card for a configured
location and confirming it lists the upcoming days (starting tomorrow) with condition and low/high
for each day.

**Acceptance Scenarios**:

1. **Given** a configured weather location, **When** the weekly forecast renders, **Then** it shows
   the upcoming days starting with tomorrow.
2. **Given** the weekly forecast is visible, **When** each day is displayed, **Then** it shows the
   condition and low/high temperature.

---

### User Story 3 - Dashboard Runs on the Latest Module Versions (Priority: P2)

As the maintainer, I ship the dashboard with all existing modules (bus departures, flights, tasks,
clock) updated to their latest published versions, so the household gets the newest widget
behavior and bug fixes without running any module behind.

**Why this priority**: The update is a maintenance slice that is valuable on its own but secondary
to the new weather feature. It must not regress existing blocks.

**Independent Test**: Can be fully tested by verifying the dependency manifest and image tags match
the latest published versions, the dashboard still renders every existing block, and the full
quality suite (lint, format, typecheck, tests) passes.

**Acceptance Scenarios**:

1. **Given** the dashboard repository, **When** the feature is complete, **Then** every existing
   module's frontend package and backend image are pinned to its latest published version.
2. **Given** updated modules, **When** the dashboard loads, **Then** all existing blocks (bus,
   flights, tasks, clock) still render correctly.

---

### User Story 4 - Weather Module Health on the Dashboard Status Panel (Priority: P2)

As a household member, I see the weather module's reachability reflected in the dashboard status
panel, so I know when the weather feed is unavailable rather than assuming the data is correct.

**Why this priority**: Health visibility is a shared dashboard capability extended to the new
module; it supports trust in the displayed data.

**Independent Test**: Can be fully tested by stopping the weather backend and confirming the status
panel shows the weather module as down while the dashboard and other blocks keep working.

**Acceptance Scenarios**:

1. **Given** the weather backend is reachable, **When** the status panel refreshes, **Then** it
   reports the weather module as up.
2. **Given** the weather backend is unreachable, **When** the status panel refreshes, **Then** it
   reports the weather module as down and the rest of the dashboard stays functional.

---

### Edge Cases

- What happens when the weather backend is unreachable? The weather cards show an unavailable state
  and the dashboard's other modules remain unaffected.
- What happens when no weather location is configured? The dashboard falls back to a default
  location so the cards still render something meaningful.
- What happens when the upstream weather provider is unreachable? The module has no local cache
  (it is stateless); the widgets surface an error state rather than stale data.
- What happens when a module update introduces an incompatible widget API? The dashboard build and
  tests fail early, and the pin is corrected before merge.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST display the current weather conditions for a configured location,
  including temperature, condition, feels-like, humidity, wind, precipitation probability, and UV.
- **FR-002**: The dashboard MUST display the coming hours as an auto-scrolling hourly strip that
  advances on its own and excludes the current hour.
- **FR-003**: The dashboard MUST display the upcoming days (starting tomorrow) as a weekly
  forecast with day, condition, and low/high temperature for each day.
- **FR-004**: The dashboard MUST allow the weather location and refresh behavior to be configured
  through the runtime configuration, with a sensible default when not provided.
- **FR-005**: The dashboard MUST route weather data requests to the weather module backend through
  the same-origin proxy contract used by every other module.
- **FR-006**: The dashboard's status panel MUST include the weather module's health alongside the
  existing modules.
- **FR-007**: The dashboard MUST pin every existing module (bus, flights, tasks, clock) to its
  latest published frontend package and backend image version.
- **FR-008**: The dashboard MUST keep all existing blocks (bus, flights, tasks, clock) rendering
  correctly after the module updates.
- **FR-009**: The dashboard MUST pass all its quality gates (lint, formatting, typecheck, and the
  full test suite) with the module updates and the new weather module in place.
- **FR-010**: The dashboard MUST include the weather module's backend in the same local deployment
  stack (backend + MCP service) used by the other modules.

### Key Entities _(include if feature involves data)_

- **Location**: The coordinates and name of the place the weather is fetched for; shared by the
  current-conditions and weekly-forecast widgets.
- **CurrentWeather**: The current conditions snapshot (temperature, condition, feels-like,
  humidity, wind, precipitation probability, UV).
- **HourlyEntry**: A single forecast hour (time, condition, temperature) inside the hourly strip.
- **DailyEntry**: A single forecast day (day, condition, low/high temperature) inside the weekly
  forecast.
- **Module**: The set of independently published backend/widget pairs (bus, flights, tasks,
  weather, clock); each has a version pin and health status.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The current-conditions and weekly-forecast cards render for the configured location
  within 3 seconds of the dashboard loading.
- **SC-002**: Both weather cards fit the existing TV grid without introducing scrolling or
  overflowing their cells.
- **SC-003**: All existing modules report their latest published versions in the version
  documentation and deployment defaults.
- **SC-004**: The dashboard builds and passes lint, formatting, typecheck, and the full test suite
  with the updates in place.
- **SC-005**: The status panel reflects weather backend reachability (up/down) and the dashboard
  stays fully functional when the weather backend is down.
- **SC-006**: The weather backend runs in the same local deployment stack as the other modules
  with no extra credentials or configuration.

## Assumptions

- "All the modules" means the currently consumed modules: bus departures, fly-over flights, tasks,
  and the clock; each is updated to its latest published version where one exists.
- The weather-psychic module is consumed the same way as the others: published frontend package
  plus a published backend image, with no source code living in this repository.
- The weather module needs no API key or account (the provider is keyless), so no secret
  configuration is required.
- A default weather location is assumed (aligned with the dashboard's home area) and can be
  overridden via runtime configuration.
- The "Weather" placeholder block is replaced by the live weather section hosting both the
  current + hourly card and the weekly forecast card.
- Module version bumps are backward-compatible with the dashboard's current widget usage; any
  breaking change is caught by the quality gates before merge.