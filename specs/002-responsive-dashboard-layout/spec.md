# Feature Specification: Responsive Multi-Device Dashboard Layout

**Feature Branch**: `feature/002-responsive-dashboard-layout`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "our current dashboard does not work nicely for mobile phones. do you have a solution for this? i want our dashboard to be reactive, adjusting well for phones, tablets and full pages. make suggestions for their design, since its simply not possible to show all information correctly right?"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Use the Dashboard on a Phone (Priority: P1)

As a household member away from the TV, I open the dashboard on my phone and can quickly see the
information that matters most right now — the current time, the next bus, current weather, and my
open tasks — without zooming, pinching, or fighting a squeezed desktop grid. Everything else
(flight list, flight map, full weather details, system status) remains reachable by scrolling.

**Why this priority**: The dashboard is currently unusable on phones, which is the primary problem
reported. A phone layout that surfaces a glanceable summary and keeps the remaining blocks reachable
delivers the core value on its own.

**Independent Test**: Can be fully tested by loading the dashboard at a 390×844 phone viewport and
confirming that no content overflows horizontally, the glanceable summary (time, next bus, current
weather, next task) is visible in the first screenful, and every other block can be reached by
vertical scrolling.

**Acceptance Scenarios**:

1. **Given** a phone viewport, **When** the dashboard loads, **Then** it presents a single vertical
   column with no horizontal scrolling anywhere.
2. **Given** a phone viewport, **When** the first screenful renders, **Then** it shows a compact
   header (time and date) plus a glanceable summary of the next bus, current weather, and the next
   open task.
3. **Given** a phone viewport, **When** the user scrolls down, **Then** the flight list, flight map,
   full weather detail, all configured bus stops, and system status are reachable in a predictable
   priority order.
4. **Given** a phone viewport, **When** the user taps any interactive element, **Then** the target is
   large enough to activate reliably without accidental taps on neighbours.
5. **Given** a phone with a display cut-out or rounded corners, **When** the dashboard renders,
   **Then** no text or controls are obscured by notches, rounded corners, or home indicators.

---

### User Story 2 - Preserve the TV / Large-Screen Experience (Priority: P1)

As a household member glancing at the wall-mounted TV, I still see the familiar three-column,
glanceable, non-scrolling dashboard with all modules visible at once, exactly as before.

**Why this priority**: The TV experience is the original and primary purpose of the dashboard. Any
responsive work must not regress it, so it is a P1 requirement alongside phone support.

**Independent Test**: Can be fully tested by loading the dashboard at a 1920×1080 and a 3840×2160
viewport and confirming the three-column arrangement, all blocks visible without scrolling, and the
same information hierarchy as the current build.

**Acceptance Scenarios**:

1. **Given** a large-screen/TV viewport, **When** the dashboard loads, **Then** all blocks are
   visible simultaneously without vertical or horizontal scrolling.
2. **Given** a large-screen/TV viewport, **When** compared with the current release, **Then** the
   block arrangement and information hierarchy are unchanged.
3. **Given** a large-screen/TV viewport, **When** the viewport width changes within the large-screen
   range, **Then** the layout scales fluidly without clipping or overflow.

---

### User Story 3 - Use the Dashboard on a Tablet (Priority: P2)

As a household member using a tablet in portrait or landscape, I see a balanced two-column layout
that uses the extra space compared with a phone while remaining readable and touch-friendly.

**Why this priority**: Tablets sit between phones and TVs; they are common in a home and benefit from
a dedicated arrangement, but phone and TV support deliver more value first.

**Independent Test**: Can be fully tested by loading the dashboard at 768×1024 (portrait) and
1024×768 (landscape) and confirming a two-column arrangement that fits without horizontal overflow
and without the phone summary being duplicated.

**Acceptance Scenarios**:

1. **Given** a tablet viewport, **When** the dashboard loads, **Then** it presents a two-column
   arrangement with the header and status spanning the full width.
2. **Given** a tablet viewport, **When** the device orientation changes, **Then** the layout adapts to
   the new orientation without requiring a reload and without content clipping.
3. **Given** a tablet viewport, **When** a block would otherwise be too small to read, **Then** it is
   given more vertical space rather than being compressed below a readable size.

---

### User Story 4 - Adapt Live to Resizing and Rotation (Priority: P3)

As a user resizing a browser window, rotating a device, or moving between split-screen and full-screen,
I see the dashboard reflow smoothly to the appropriate layout for the new viewport, with no reload and
no lost state.

**Why this priority**: Live adaptation improves polish and covers split-screen and rotation, but the
dashboard is already usable if it adapts correctly on load at each device size.

**Independent Test**: Can be fully tested by resizing a browser window continuously across phone,
tablet, and desktop widths and confirming the layout switches at the expected viewport classes without
horizontal scrollbars, clipped content, or a page reload.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** the viewport crosses from one device class to another,
   **Then** the layout switches to the appropriate arrangement for the new class.
2. **Given** the dashboard is open, **When** the viewport is resized, **Then** no horizontal scrollbar
   appears and no block is clipped.
3. **Given** the user has scrolled on a phone layout, **When** the viewport grows to a TV layout,
   **Then** the dashboard returns to a non-scrolling, fully visible layout.

---

### Edge Cases

- What happens on very narrow phone viewports (320 px wide) and on tall/narrow foldables?
- What happens on a phone in landscape with limited vertical height (for example 844×390)?
- What happens on a large tablet in split-screen, where the usable width falls between phone and
  tablet classes?
- What happens at 200% browser zoom on a desktop, which effectively halves the usable width?
- What happens when a block has no data (no bus stops configured, no flights overhead, no tasks)?
- What happens when a module backend is offline while the layout is adapting?
- What happens when block labels or stop names are unusually long and would otherwise wrap or clip?
- What happens when the user has enabled reduced motion and blocks would animate while reflowing?
- What happens when the device has a notch, rounded corners, or a gesture home indicator?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST adapt its arrangement to at least four viewport classes: phone,
  tablet, desktop/laptop, and large-screen/TV.
- **FR-002**: The dashboard MUST NOT introduce horizontal scrolling at any supported viewport size.
- **FR-003**: On phone viewports the dashboard MUST use a single vertical column, with vertical
  scrolling permitted only where content cannot fit on one screen.
- **FR-004**: On phone viewports the dashboard MUST present a compact glanceable summary containing
  the current time, the next bus departure, the current weather, and the next open task within the
  first screenful.
- **FR-005**: On phone viewports every dashboard block MUST remain reachable, ordered by importance
  (summary, weather, bus, tasks, flights, map, system status) with the ordering determined by a
  documented default that can be changed through runtime configuration.
- **FR-006**: On tablet viewports the dashboard MUST present a two-column arrangement with the header
  and system status spanning the full width.
- **FR-007**: On desktop/laptop viewports the dashboard MUST present the existing multi-column
  arrangement with all blocks visible without scrolling whenever the viewport permits.
- **FR-008**: On large-screen/TV viewports the dashboard MUST preserve the current three-column,
  non-scrolling arrangement and information hierarchy.
- **FR-009**: The dashboard MUST reflow between viewport classes during live resize and orientation
  changes without a page reload and without losing loaded data.
- **FR-010**: The dashboard MUST keep all text at a legible size for each viewport class, never
  compressing content below a readable minimum in order to make it fit.
- **FR-011**: The dashboard MUST ensure interactive targets meet minimum touch-target guidance on
  touch-oriented viewport classes.
- **FR-012**: The dashboard MUST avoid clipping any block content; where a block cannot fit, it MUST
  grow or scroll within its own region rather than overflowing or being cut off.
- **FR-013**: The dashboard MUST respect device safe areas so that content is not obscured by notches,
  rounded corners, or gesture indicators.
- **FR-014**: The dashboard MUST allow secondary detail (for example extended weather fields, the
  flight map, or full system status) to be collapsed or deferred on small viewports so primary
  information stays glanceable.
- **FR-015**: The dashboard MUST define, in documentation, the viewport classes it supports, the
  arrangement used for each, and the default block priority order.
- **FR-016**: The dashboard MUST allow the default block priority and the visibility of individual
  blocks to be adjusted through runtime configuration without code changes.
- **FR-017**: The dashboard MUST retain the existing data-refresh and health-probing behavior for
  every block across all viewport classes; adaptation MUST NOT change what data is fetched or how
  often.
- **FR-018**: The dashboard MUST honor reduced-motion preferences when blocks are revealed or
  rearranged on small viewports.

### Key Entities

- **Viewport class**: A named range of usable screen dimensions (phone, tablet, desktop/laptop,
  large-screen/TV) that determines the layout arrangement.
- **Layout arrangement**: The number and ordering of columns, and which blocks span full width, for a
  given viewport class.
- **Block**: A dashboard tile backed by a module widget (clock/header, weather, bus, tasks, flights
  closest list, flight map, system status).
- **Block priority**: The documented order in which blocks appear on small viewports and the rule for
  which blocks are condensed into the glanceable summary.
- **Visibility policy**: The per-block rule describing whether a block is shown in full, summarized,
  collapsed, or hidden for a viewport class.

## Proposed Responsive Design (Design Direction)

The dashboard cannot show every block at full size on a phone, so each viewport class prioritizes
different information rather than shrinking everything uniformly.

| Viewport class    | Suggested arrangement                                                                                                                            | Information priority                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Phone (portrait)  | Single scrolling column; compact sticky header; consolidated "Now" summary card; secondary blocks stacked below; flight map collapsed by default | Time/date → next bus → current weather → next task → full weather detail → all bus stops → flight list → map → status |
| Phone (landscape) | Two short columns or a horizontally scrollable summary strip above a single column                                                               | Time/date + next bus and current weather side by side, then the same stacked priority                                 |
| Tablet            | Two columns; header and status full width                                                                                                        | Flights (list + map) in one column; weather, tasks, and bus in the other                                              |
| Desktop/laptop    | Existing multi-column arrangement, fluid within the class                                                                                        | All blocks visible                                                                                                    |
| Large-screen/TV   | Existing three-column, non-scrolling arrangement                                                                                                 | All blocks visible at once, unchanged from today                                                                      |

Supporting design suggestions:

- Keep the glanceable summary as a small set of single-line facts (next bus in N minutes, current
  temperature and condition, next task title) so it fits without vertical scrolling.
- Let the hourly weather strip scroll horizontally by touch on phones; this is a deliberate exception
  to the no-horizontal-scroll rule because it is a widget-internal strip, not page-level scrolling.
- Give the flight map a reduced, collapsible presentation on phones since a map is least useful on a
  small screen and is the largest block.
- Replace the full status footer with a single compact status indicator on phones, expanding to the
  full module list only when tapped.
- Use the same cards and visual language across viewport classes so the dashboard feels like one
  product; only density and ordering change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of dashboard blocks are reachable on a 390×844 phone viewport without horizontal
  scrolling and without zooming.
- **SC-002**: On a 390×844 phone viewport, the glanceable summary (time, next bus, current weather,
  next task) is fully visible within the first screenful without scrolling.
- **SC-003**: Across phone, tablet, desktop, and large-screen viewports (320 px to 3840 px wide), no
  horizontal page scrollbar appears and no block content is clipped.
- **SC-004**: The large-screen/TV layout remains visually equivalent to the current release, with all
  blocks visible without scrolling at 1920×1080 and 3840×2160.
- **SC-005**: Switching between viewport classes by resizing takes effect immediately, with no page
  reload and no visible loss of loaded data.
- **SC-006**: Users can reach any block on a phone in no more than five vertical swipes from the top.
- **SC-007**: All interactive elements on phone and tablet viewports meet the minimum touch-target
  size, verified by measurement in the built interface.
- **SC-008**: Text remains legible at every supported viewport class, with no block compressing text
  below the documented readable minimum.

## Assumptions

- Vertical scrolling is acceptable on phone and tablet viewports; the existing non-scrolling rule is
  preserved only for large-screen/TV viewports.
- Viewport class is determined from the usable viewport size, not from user-agent detection or device
  model.
- The dashboard continues to consume the published module widgets unchanged; adaptation is achieved
  by arranging, sizing, condensing, and ordering those widgets, not by forking them.
- A compact summary can be composed from data the existing widgets already fetch, without new backend
  endpoints.
- The default priority order (summary, weather, bus, tasks, flights, map, status) reflects a typical
  household's needs and can be overridden in runtime configuration.
- Supporting phone landscape, split-screen, and browser zoom is in scope; native mobile apps and
  offline-first behavior are not.
- System status may be condensed on small viewports but its underlying health probing continues
  unchanged.
- Existing refresh cadences, proxy contract, and module configuration remain unchanged by this
  feature.
