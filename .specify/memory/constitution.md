<!--
Sync Impact Report
==================
Version change: n/a (initial constitution for the dashboard repository)
-->

# Home Sweet Home — Dashboard Constitution

## Core Principles

### I. Dashboard-First

The Home Sweet Home dashboard is a single, standalone TV/large-screen application. It
embeds the **published** module widgets (`@sousa99/*-components` from GitHub Packages) and
launches the module backends from their **published** GHCR images (`ghcr.io/sousa99`). No
module source lives in this repository — modules are consumed as packages and images only.

### II. Local-First & Private by Default

The dashboard runs on in-home infrastructure first and stays functional offline while its
local backends are reachable. Household data remains in the local module databases
(`./data/`). External access, cloud sync, and remote tooling are opt-in and MUST be
explicitly documented.

### III. Declared Identity & Uniform Tooling

Identity is declared in `package.json` (`@sousa99/home-sweet-home-dashboard`). The
dashboard extends the shared presets from `@sousa99/homesweethome-config` so lint, format,
and typecheck behave identically across the ecosystem. No per-repo config drift.

### IV. Test-First (NON-NEGOTIABLE)

TDD is mandatory: tests are written first, user approved, tests fail, then implementation.
The Red-Green-Refactor cycle is strictly enforced. Vitest is the standard runner.

### V. Contract & Integration Testing

Integration behavior — the `/api/<module>` proxy contract, per-module widget `baseUrl`s,
MCP endpoints, and health probing — is covered by tests and smoke checks before merge.
`deploy/nginx.conf` and the Vite dev proxy (`vite.config.ts`) MUST stay in sync; changing
one without the other breaks either the container or local development.

## Technology & Packaging Standards

- Frontend: Vite, React 19, Tailwind CSS v4.
- Tooling: pnpm 11, TypeScript, ESLint, Prettier, Vitest.
- Widgets come from `@sousa99/*-components`; backends run from the `ghcr.io/sousa99/*`
  container images.
- Each module's components package and backend image are pinned **independently** (see
  `docs/versions.md`); there is no cross-module version coupling.
- The dashboard image publishes to `ghcr.io/sousa99/home-sweet-home-dashboard`.

## Repository Structure & Spec-Driven Development

- The dashboard is a single package at the repository root (`src/`), alongside `deploy/`,
  `docker-compose.yml`, `public/config.json`, and `.specify/` (Spec Kit state).
- Spec-driven development happens under `specs/` at the repository root: active features
  are `specs/NNN-name/` (specify, plan, then tasks) — documented before implementation.
- Bug work follows the Speckit bug workflow (`.specify/extensions/bug/`): assess, fix,
  test, with per-bug reports stored under `.specify/bugs/<slug>/`.

## Development Workflow & Quality Gates

- Merge gates: shared ESLint/Prettier clean, typecheck passes, and the full Vitest suite
  passes. `docker compose up -d --build` smoke-tests the whole stack before merge.
- Every PR is code-reviewed; reviewers MUST verify compliance with this constitution.
- Runtime block configuration lives in `public/config.json` (bind-mounted into the
  dashboard container); the proxy contract in `deploy/nginx.conf` mirrors
  `vite.config.ts`.

## Governance

- This constitution supersedes all other project practices; no practice may contradict it.
- Amendments require: documentation of the change, approval, and a migration plan when the
  change is material.
- Versioning is semantic. MAJOR for backward-incompatible principle removals or
  redefinitions; MINOR for new principles or materially expanded guidance; PATCH for
  clarifications, wording, and typo fixes.
- Compliance is reviewed on every PR and revisited on every amendment.
- Runtime development guidance follows `setup.md` and the Spec Kit workflow.

**Version**: 1.0.0 | **Ratified**: 2026-10-04 | **Last Amended**: 2026-10-04
