# Contract: Theme Tokens

**Owner**: `@sousa99/homesweethome-theme` (modules monorepo, published via GitHub Packages)
**Consumers**: dashboard (`@sousa99/home-sweet-home-dashboard`) and all five widget packages
**Version**: 0.1.0

## 1. Package surface

```text
@sousa99/homesweethome-theme
├── ./theme.css    # tokens, selectors, Tailwind @theme inline mapping, shared primitives
└── ./tokens       # typed token names/values for tests and documentation (no runtime CSS)
```

`theme.css` MUST be self-contained: importing it must not require any other stylesheet.

## 2. Selector contract

```css
:root,
[data-theme='light'] {
  color-scheme: light; /* light values */
}

[data-theme='dark'] {
  color-scheme: dark; /* dark values */
}
```

- Tokens are always declared on `:root` and `[data-theme='light']`.
- `[data-theme='dark']` overrides the same names.
- With no attribute, the light identity applies. This makes widget packages safe to consume before
  the dashboard ships dark-mode support.
- No token may be defined only under a media query.

## 3. Token names and values

All shape values are rem-based so they scale with the dashboard root font-size clamp.

| Token                 | Light             | Dark              |
| --------------------- | ----------------- | ----------------- |
| `--hsh-bg`            | `#f1eee4`         | `#101010`         |
| `--hsh-surface`       | `#fffdf6`         | `#1a1a1a`         |
| `--hsh-surface-alt`   | `#f7f3e8`         | `#222222`         |
| `--hsh-ink`           | `#111111`         | `#f6f2e7`         |
| `--hsh-ink-muted`     | `#4b4b4b`         | `#b9b4a8`         |
| `--hsh-accent`        | `#ff5a36`         | `#c8ff3d`         |
| `--hsh-accent-ink`    | `#111111`         | `#111111`         |
| `--hsh-outline`       | `#111111`         | `#f6f2e7`         |
| `--hsh-shadow-color`  | `#111111`         | `#000000`         |
| `--hsh-ok`            | `#0a7a3d`         | `#8ce99a`         |
| `--hsh-warn`          | `#8a4a00`         | `#ffd43b`         |
| `--hsh-error`         | `#b3261e`         | `#ff8787`         |
| `--hsh-info`          | `#1d4ed8`         | `#74c0fc`         |
| `--hsh-map-bg`        | `#dce8ff`         | `#16200a`         |
| `--hsh-map-line`      | `#93a9d6`         | `#3c5420`         |
| `--hsh-radius`        | `0px`             | `0px`             |
| `--hsh-border-width`  | `0.1875rem`       | `0.1875rem`       |
| `--hsh-shadow-offset` | `0.375rem`        | `0.375rem`        |
| `--hsh-font-display`  | system sans stack | system sans stack |
| `--hsh-font-body`     | system sans stack | system sans stack |

**Accent budget**: exactly one accent value per appearance. Light uses orange-red `#ff5a36`; dark uses
acid green `#c8ff3d`. No other accent-like hue may appear in widget source.

## 4. Tailwind mapping

The package maps raw tokens through `@theme inline` so compiled utilities resolve at runtime:

| Tailwind utility family                           | Maps to                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `bg-surface`, `bg-surface-alt`, `bg-bg`           | `--hsh-surface`, `--hsh-surface-alt`, `--hsh-bg`                              |
| `text-ink`, `text-ink-muted`                      | `--hsh-ink`, `--hsh-ink-muted`                                                |
| `text-accent`, `bg-accent`, `text-accent-ink`     | accent roles                                                                  |
| `border-outline`, `text-outline`                  | `--hsh-outline`                                                               |
| `text-ok`, `text-warn`, `text-error`, `text-info` | status roles                                                                  |
| `bg-map`, `text-map-line`                         | map roles                                                                     |
| `font-display`, `font-body`                       | type roles                                                                    |
| `shadow-brutal`                                   | `var(--hsh-shadow-offset) var(--hsh-shadow-offset) 0 var(--hsh-shadow-color)` |
| `border-brutal`                                   | `var(--hsh-border-width) solid var(--hsh-outline)`                            |
| `rounded-brutal`                                  | `var(--hsh-radius)`                                                           |

Shared primitives (`.hsh-heading`, `.hsh-card`, `.hsh-button`, `.hsh-badge`, `.hsh-input`,
`.hsh-focus`) MAY be provided for patterns used in three or more places. They must only use tokens.

## 5. Accessibility requirements

Computed from the values above and enforced by tests:

| Pair                                | Minimum |
| ----------------------------------- | ------- |
| `--hsh-ink` / `--hsh-bg`            | 4.5:1   |
| `--hsh-ink` / `--hsh-surface`       | 4.5:1   |
| `--hsh-ink-muted` / `--hsh-surface` | 4.5:1   |
| `--hsh-accent-ink` / `--hsh-accent` | 4.5:1   |
| `--hsh-ok` / `--hsh-surface`        | 4.5:1   |
| `--hsh-warn` / `--hsh-surface`      | 4.5:1   |
| `--hsh-error` / `--hsh-surface`     | 4.5:1   |
| `--hsh-info` / `--hsh-surface`      | 4.5:1   |
| `--hsh-outline` / `--hsh-surface`   | 3:1     |
| `--hsh-outline` / `--hsh-bg`        | 3:1     |

If a value is adjusted later, the contrast test is the gate. Do not weaken thresholds.

## 6. Change rules

- Token names are a public contract. Additive tokens are a minor change; renames/removals are major.
- Both appearances must always be updated together.
- The package is the single source of truth; do not copy the token block into another repository.
- The dashboard's token-completeness test parses the published `theme.css`; drift fails CI.
