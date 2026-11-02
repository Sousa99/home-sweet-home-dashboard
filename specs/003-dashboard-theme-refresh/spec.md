# Feature Specification: Dashboard Visual Identity Refresh (Light & Dark)

**Feature Branch**: `feature/003-dashboard-theme-refresh`

**Created**: 2026-11-01

**Status**: Draft

**Input**: User description: "i dont really loveeee the style on light mode, but I specially don't like the syle on dark mode. i want something different, not overlly complex but different you know. note that for this we also need to change each of the modules styling right, as they all need to match."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - A Refreshed, Intentional Light Appearance (Priority: P1)

As a household member looking at the dashboard during the day, I want the light appearance to feel
deliberately designed and different from the current warm amber-on-cream look, so the dashboard feels
fresh and contemporary rather than like an unmodified default theme.

**Why this priority**: The user explicitly dislikes the current light appearance. Replacing it is the
core of the request and delivers value on its own even before the dark appearance is considered.

**Independent Test**: Can be fully tested by loading the dashboard with the light appearance active at
a TV viewport and verifying that the new palette, typography, surfaces, and accent treatment are
present across every visible block, with none of the previous amber/slate styling remaining.

**Acceptance Scenarios**:

1. **Given** the light appearance is active, **When** the dashboard loads, **Then** every block and
   embedded widget uses the new visual identity rather than the previous warm amber-on-cream palette.
2. **Given** the light appearance is active, **When** the user views the dashboard, **Then** the
   hierarchy of headings, values, labels, and secondary text is visually obvious at a glance.
3. **Given** the light appearance is active, **When** any block displays a loading, empty, error, or
   placeholder state, **Then** that state uses the same new visual identity.

---

### User Story 2 - A First-Class Dark Appearance (Priority: P1)

As a household member looking at the dashboard in the evening or at night, I want a genuinely dark
appearance that is comfortable and intentional — not the light theme inverted, dimmed, or wrapped in
a heavy black overlay — so the dashboard is pleasant to glance at without glare.

**Why this priority**: The current dark appearance is the user's strongest complaint. A deliberate
dark theme is required for the feature to be considered complete.

**Independent Test**: Can be fully tested by activating the dark appearance and confirming that all
surfaces, text, widgets, the map, and all status indicators are readable, cohesive, and free of
light-theme remnants (for example white cards or unreadably low-contrast labels).

**Acceptance Scenarios**:

1. **Given** the dark appearance is active, **When** the dashboard loads, **Then** the background,
   panels, and text all use the dark identity with no white or near-white panel surfaces.
2. **Given** the dark appearance is active, **When** the user reads any block, **Then** all body text,
   labels, values, and icons are comfortably legible.
3. **Given** the dark appearance is active, **When** the user views the flight map, weather
   illustration, or any externally rendered content, **Then** that content remains legible and does
   not break the dark composition.
4. **Given** the appearance is switched between light and dark, **When** the switch occurs, **Then**
   the dashboard does not flash an unstyled or wrong-theme frame.

---

### User Story 3 - One Visual Language Across All Modules (Priority: P1)

As a household member, I want every block — clock, weather, flights, flight map, tasks, bus, and
system status — to look like it belongs to the same product, so the dashboard reads as one coherent
screen rather than a collage of independently styled widgets.

**Why this priority**: The user explicitly called out that all modules must match. A beautiful
dashboard shell wrapped around mismatched module widgets would not satisfy the request.

**Independent Test**: Can be fully tested by viewing all blocks together in both appearances and
confirming that colors, typography, surface treatment, corner shapes, borders, iconography, and
status semantics are consistent everywhere, with no block retaining the old palette.

**Acceptance Scenarios**:

1. **Given** any two blocks are visible together, **When** the user compares them, **Then** they share
   the same palette, bold uppercase headings, flat fills, outline weight, hard-shadow treatment, and
   spacing rhythm.
2. **Given** a module widget is updated to the new identity, **When** it renders inside the dashboard,
   **Then** it inherits the active appearance without per-block recoloring, gradients, soft shadows,
   or extra accent colors that break the shared language.
3. **Given** a block has no data or is unavailable, **When** it renders, **Then** its fallback state
   still matches the surrounding visual language.

---

### User Story 4 - Choosing and Keeping an Appearance (Priority: P2)

As a household member, I want the dashboard to follow my device's light/dark preference by default,
while still being able to pick an appearance myself, so the screen is comfortable at any time of day
without re-configuring it.

**Why this priority**: A theme choice is only useful if it can be selected and survives reloads; this
completes the experience but is secondary to the two appearances themselves.

**Independent Test**: Can be fully tested by changing the device preference, then using any manual
theme control, reloading the dashboard, and confirming the chosen appearance is applied immediately
and remembered.

**Acceptance Scenarios**:

1. **Given** no manual choice has been made, **When** the dashboard loads, **Then** it follows the
   device's light/dark preference.
2. **Given** a manual choice has been made, **When** the dashboard reloads, **Then** the manual choice
   is restored instead of the device preference.
3. **Given** the user changes the appearance, **When** the change is applied, **Then** it takes effect
   without a page reload.

---

### Edge Cases

- What happens when an embedded module widget has not yet been updated to the new visual identity?
- How does the flight map or weather imagery behave in the dark appearance when external map tiles or
  images are light by default?
- What happens when the operating system switches between light and dark while the dashboard is open
  and no manual choice has been made?
- How are semantic status colors (healthy, warning, unavailable) kept distinguishable for users with
  color-vision deficiencies in both appearances?
- What happens to placeholders, loading skeletons, and error states in each appearance?
- How does the design hold up at phone, tablet, 1080p, and 4K sizes without introducing overflow or
  unreadable text?
- What happens to motion and animations when the user prefers reduced motion?
- How does the design behave under high-contrast or forced-colors accessibility settings?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST provide two complete appearances: a light appearance and a dark
  appearance.
- **FR-002**: The light appearance MUST adopt a neo-brutalist identity — off-white and ink surfaces,
  bold uppercase display type, flat fills, one vivid accent color, thick uniform outlines, and hard
  offset shadows — clearly distinct from the current warm amber-on-cream look.
- **FR-003**: The dark appearance MUST be designed as a deliberate dark counterpart of the same
  identity — near-black surfaces, light outlines and text, a single accent, and hard offset shadows —
  rather than a dimmed or inverted copy of the light appearance.
- **FR-004**: The two appearances MUST share one design language — the same color roles, typography
  hierarchy, surface/elevation treatment, corner shapes, borders, and icon style — differing only in
  the values assigned to those roles.
- **FR-005**: Every dashboard-owned surface (shell, header, block containers, controls, placeholders,
  loading and error states) MUST use the shared visual roles rather than one-off or hardcoded styling.
- **FR-006**: Every embedded module widget MUST render with the same shared visual roles as the
  dashboard, so all blocks share one palette, heading treatment, outline weight, hard-shadow
  treatment, and spacing rhythm.
- **FR-007**: Module widget packages that cannot adopt the shared visual roles through their published
  interface MUST be updated and re-released as part of this feature, so no block keeps the previous
  visual identity. This includes simplifying widgets where needed — flattening fills, removing soft
  shadows and decorative gradients, reducing competing accent colors, and aligning corner, border,
  and type treatments.
- **FR-008**: Semantic status colors (healthy, warning, error, informational) MUST remain consistent
  and distinguishable in both appearances.
- **FR-009**: All text and interactive elements MUST meet the standard accessibility contrast thresholds
  in both appearances.
- **FR-010**: The dashboard MUST follow the device's light/dark preference by default and MUST provide
  a visible in-dashboard control to override it; the override MUST be remembered across reloads.
- **FR-011**: Changing the appearance MUST apply immediately without a full page reload and without
  displaying an unstyled or wrong-theme frame on load.
- **FR-012**: The refresh MUST be presentation-only: it MUST NOT change the information shown, block
  order, layout behavior, data refresh behavior, or any existing interaction.
- **FR-013**: The refreshed design MUST remain legible and free of horizontal overflow at phone,
  tablet, and TV/large-screen sizes, including the existing responsive arrangement.
- **FR-014**: Motion MUST continue to respect the user's reduced-motion preference; the new identity
  MUST NOT depend on decorative animation.
- **FR-015**: Externally rendered content (flight map, weather imagery, and any embedded media) MUST
  remain legible and visually harmonious in both appearances.
- **FR-016**: The identity MUST stay restrained: one accent color per appearance, one outline weight,
  one hard-shadow offset, no textures, and no ornamental effects. The neo-brutalist treatment must
  not make the dashboard harder to scan at a glance.

### Key Entities

- **Appearance**: One of two complete visual modes (light or dark) that assigns values to every
  shared visual role.
- **Visual Role**: A named styling purpose shared by the dashboard and all modules — for example
  background, surface, ink, muted ink, single accent, outline, hard shadow, and semantic status
  colors.
- **Theme Preference**: The user's stored choice of appearance, or the absence of a choice indicating
  that the device preference should be followed.
- **Module Widget**: An externally published block rendered inside the dashboard that must consume the
  shared visual roles.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In both appearances, 100% of visible blocks — including all seven embedded module
  widgets — use the new visual identity; no block retains the previous amber/slate styling.
- **SC-002**: Automated contrast checks report zero failures for text and interactive elements in both
  appearances.
- **SC-003**: A visual consistency review covering every block in both appearances passes 100% of its
  checklist items (palette, typography, surfaces, shapes, status semantics).
- **SC-004**: The chosen appearance is restored after 100% of reloads, and switching appearances takes
  effect in under one second without a page reload.
- **SC-005**: Loading the dashboard never shows an unstyled or wrong-theme frame; the correct
  appearance is visible from the first painted content.
- **SC-006**: The refreshed dashboard introduces zero new horizontal overflow and zero content
  regressions at phone, tablet, 1080p, and 4K sizes.
- **SC-007**: The dashboard's existing data-refresh and responsiveness behaviors are unchanged, as
  confirmed by the existing test suite passing without behavioral modifications.
- **SC-008**: A styling audit finds exactly one accent color, one outline weight, and one hard-shadow
  offset in use, with zero soft shadows and zero decorative gradients in either appearance.

## Assumptions

- The user wants a full visual identity change (palette, typography, surfaces, shapes), not a minor
  palette tweak.
- The chosen direction is **neo-brutalist**: off-white/ink in light, near-black/ink in dark, bold
  uppercase display type, flat fills, one vivid accent, thick outlines, and hard offset shadows.
- The identity stays simple and uncluttered: no ornamental effects, textures, or layered visuals, and
  no loss of at-a-glance scanability.
- The dashboard owns the definition of the shared visual roles, and the module widget packages adopt
  them; simplifying and re-releasing module widgets is in scope for this feature.
- The dark appearance is a day-one, first-class deliverable rather than a later enhancement.
- The existing information architecture, block set, layout, and data behavior remain exactly as they
  are; this feature changes only how the dashboard looks.
- Accessibility expectations already assumed by the project (contrast, reduced motion, touch target
  size) continue to apply.
- The appearance follows the device preference until the user sets a manual theme, which is then
  remembered across reloads.
