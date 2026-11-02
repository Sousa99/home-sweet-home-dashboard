# Quickstart & Validation Guide: Dashboard Visual Identity Refresh

Use this guide to prove the feature end-to-end. Contracts are in
[`contracts/`](./contracts/); token semantics are in [`data-model.md`](./data-model.md). Do not treat
this file as implementation code.

## Prerequisites

- Node 24+, pnpm 11.25, Docker (for the full-stack smoke test)
- Two checkouts: this dashboard repo and the sibling modules monorepo
  (`../home-sweet-home-modules` in a standard layout)
- GitHub Packages access configured for `@sousa99/*` (see `setup.md`)
- Playwright Chromium: `pnpm exec playwright install chromium`

## 1. Modules workstream (run in `home-sweet-home-modules`)

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test                         # includes the new theme contract + palette guard
pnpm -r build:lib                 # each widget produces dist-lib/styles.css
```

Expected: all packages green; the palette guard reports **0 forbidden patterns**; the theme package's
contrast test reports **0 failures**; each `dist-lib/styles.css` contains the `--hsh-*` tokens and no
legacy amber/slate utilities in widget source.

Storybook spot-check (both appearances via the theme toolbar):

```bash
pnpm --filter @sousa99/weather-psychic-components storybook
pnpm --filter @sousa99/fly-over-tracker-components storybook
pnpm --filter @sousa99/procrastinator-tracker-components storybook
pnpm --filter @sousa99/bus-catcher-components storybook
pnpm --filter @sousa99/current-time-components storybook
```

Release (after review):

```bash
pnpm changeset                    # theme 0.1.0; widgets minor
pnpm version
pnpm release                      # publishes to GitHub Packages
```

Record the published versions for the dashboard pins (see §3).

## 2. Local bootstrap before publishing (optional)

If the new theme package is not published yet, link it locally:

```bash
# in home-sweet-home-modules
pnpm --filter @sousa99/homesweethome-theme link --global

# in this dashboard repo
pnpm link --global @sousa99/homesweethome-theme
```

Remove the global link and reinstall from GitHub Packages before merging.

## 3. Dashboard workstream (run in this repo)

```bash
pnpm install                      # after publishing/bumping widget versions
pnpm dev                          # http://localhost:5173
```

Manual checks at `http://localhost:5173`:

1. **Default follows the OS.** Set DevTools → Rendering → Emulate `prefers-color-scheme` to dark;
   reload. Expect `data-theme="dark"` on `<html>` before the first visible frame (no white flash).
2. **Manual override.** Choose Light, then Dark in the header control. Each applies without reload;
   the selected button shows pressed state; the whole dashboard and every widget retheme.
3. **Persistence.** Reload with Dark selected. Expect Dark, `localStorage['hsh.dashboard.theme']` set
   to `"dark"`, and the OS preference ignored.
4. **Back to System.** Choose System. The key disappears; the dashboard follows the emulated OS
   preference again.
5. **Map basemap.** In Dark, the flight map requests the Esri dark tile host with correct
   attribution; in Light it requests OpenStreetMap.
6. **No layout change.** TV (1920×1080, 3840×2160) remains three columns without scrolling; phone
   (390×844) remains a single scrolling column with comfortably sized theme buttons.
7. **States.** Loading, empty, offline, and placeholder states all use the new identity in both
   appearances (stop a backend to see offline states if desired).

Reset the manual choice:

```bash
# DevTools console
localStorage.removeItem('hsh.dashboard.theme');
location.reload();
```

## 4. Automated verification (dashboard)

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm exec vitest run tests/theme/tokens.test.ts
pnpm exec vitest run tests/theme/palette-guard.test.ts
pnpm test:e2e
pnpm exec playwright test tests/e2e/theme.spec.ts
pnpm build
```

Expected:

- Token test: both appearances define every required token; **0 contrast failures** at the 4.5:1 /
  3:1 thresholds.
- Palette guard: **0** raw palette utilities or color literals in `src/**/*.tsx`.
- `useTheme` tests: full resolution/persistence/media/storage matrix passes.
- Theme e2e: `data-theme`, persistence, System return, control accessibility, map host switch, and no
  horizontal overflow at phone/tablet/TV.
- Existing responsive matrix stays green (no behavioral regression).
- Production build succeeds.

## 5. Full-stack smoke test

```bash
docker compose up -d --build
open http://localhost:3304
```

Expected: the dashboard renders with the new identity, defaults to the device preference, the manual
control persists across reloads, and widgets match the shell. Confirm the module APIs still work (no
`/api/<module>` changes).

## 6. Manual visual acceptance (both appearances)

Check each item at TV and phone sizes:

- [ ] Off-white/ink light appearance is clearly neo-brutalist (flat, outlined, hard-shadowed).
- [ ] Dark appearance is near-black with light outlines; no white panels or light-theme remnants.
- [ ] Every block — clock, weather, flights, map, tasks, bus, status — shares never more than one
      accent, one outline weight, and one hard-shadow offset.
- [ ] No gradients, soft shadows, blur, or decorative textures remain.
- [ ] Headings are bold uppercase display type; body text is comfortably legible.
- [ ] Status colors (ok/warn/error/info) are distinct in both appearances.
- [ ] Focus rings are visible on the theme control and all interactive widget elements.
- [ ] No horizontal overflow or clipping at phone, tablet, 1080p, or 4K.
- [ ] Reduced-motion mode still suppresses non-essential animation.
- [ ] The first painted frame is already the correct theme (no flash) on a cold reload.

## 7. Documentation sync

- Update `docs/versions.md` with the new component versions.
- Update `README.md` with a short "Appearance" section (System/Light/Dark, storage key, map basemaps).
- Note the theme package and both basemap defaults in `public/config.json` / `src/config.ts`.
