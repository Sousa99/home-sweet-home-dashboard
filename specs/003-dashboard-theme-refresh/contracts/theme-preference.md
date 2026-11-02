# Contract: Theme Preference & Runtime Appearance

**Owner**: dashboard (`src/theme/`, `index.html`)
**Consumers**: dashboard shell, host blocks, flight map selection

## 1. Storage contract

| Item    | Value                                                              |
| ------- | ------------------------------------------------------------------ |
| Key     | `hsh.dashboard.theme`                                              |
| Values  | `"light"` or `"dark"`                                              |
| Absence | System (follow the device preference)                              |
| Invalid | Treated as absence; the key is never trusted blindly               |
| Scope   | Device-local; never sent to a backend or included in `config.json` |

All reads/writes MUST be wrapped in `try/catch`. Storage failures never block rendering; the app
falls back to System.

## 2. DOM contract

| Item           | Contract                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| Root attribute | `<html data-theme="light">` or `<html data-theme="dark">`                  |
| Also set       | `color-scheme` via theme CSS (not inline JS)                               |
| No attribute   | Light identity applies (safe default for widgets)                          |
| Single writer  | Only `useTheme` (and the boot script before mount) writes it               |
| Never          | `class="dark"`, per-block theme attributes, or widget-level JS theme flags |

## 3. First-paint (no flash) contract

An inline, blocking script in `index.html` runs before the app bundle:

1. Read `localStorage.getItem('hsh.dashboard.theme')` inside `try/catch`.
2. If it is exactly `"light"` or `"dark"`, use it; otherwise use
   `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`.
3. Set `document.documentElement.dataset.theme = resolved`.
4. A tiny critical `<style>` sets `html`/`body` background from `--hsh-bg`-equivalent literals for
   both attribute values so the first paint is already the correct color.

The script must be small, dependency-free, and safe if `matchMedia` is unavailable (defaults to
light). It must not throw.

## 4. Resolution behavior (`useTheme`)

| Preference | OS changes to light | OS changes to dark | Resulting `data-theme` |
| ---------- | ------------------- | ------------------ | ---------------------- |
| System     | —                   | —                  | light                  |
| System     | —                   | yes                | dark                   |
| Light      | yes                 | yes                | light (ignored)        |
| Dark       | yes                 | yes                | dark (ignored)         |

- `matchMedia('(prefers-color-scheme: dark)')` listener is attached only while the preference is
  System; it is removed when a manual choice is made.
- A `storage` event for the key re-resolves the appearance in other tabs.
- Invalid stored values resolve to System.
- Selecting System removes the key (so the device preference applies again).
- Selecting Light/Dark writes the key and applies immediately, without reload.

## 5. Control contract (`ThemeControl`)

- Three fixed options in this order: **System**, **Light**, **Dark**.
- Rendered as a group of real `<button>` elements with `aria-pressed` on the selected option.
- Each option has an accessible name (visible text on desktop; `aria-label` retained when icons
  collapse on phone).
- Icons: `Monitor` (System), `Sun` (Light), `Moon` (Dark) from `lucide-react`.
- Placement: dashboard header, right side near the clock; on phone it collapses to icon-only buttons
  while keeping 44px touch targets.
- Keyboard operable; visible focus ring using the outline token; no hover-only affordance.
- Visual style: square, thick outline, hard shadow, single accent for the selected state.
- The control MUST NOT change layout height enough to push blocks off a TV viewport.

## 6. Map selection contract

The resolved appearance selects exactly one `flights.tileLayers` entry (`light` or `dark`) and forwards
its `url` and `attribution` to the fly-over map card. Switching appearance updates the tile layer
without remounting the dashboard or losing the map view.

## 7. Acceptance tests

- Unit: resolution matrix above, storage fallback on throwing storage, invalid value → System,
  System selection removes the key, media listener attach/detach, cross-tab sync.
- E2E: default follows `emulateMedia`; manual selection survives reload; System returns to following
  emulated media; control state matches appearance; map tile host changes with appearance; no
  horizontal overflow in either appearance at phone/tablet/TV; the initial background matches
  `data-theme` on a cold reload.
