import composeRaw from '../../docker-compose.yml?raw';
import docsRaw from '../../docs/versions.md?raw';
import envRaw from '../../.env.example?raw';
import lockRaw from '../../pnpm-lock.yaml?raw';
import pkgRaw from '../../package.json?raw';

export const FLY_OVER_WIDGET = '@sousa99/fly-over-tracker-components';
export const FLY_OVER_ENV = 'HSH_FLY_OVER_TRACKER_BACKEND_VERSION';

const required = (value: string | undefined, message: string): string => {
  if (value === undefined) throw new Error(message);
  return value;
};

export function widgetSpecifier(): string {
  const pkg = JSON.parse(pkgRaw) as { dependencies: Record<string, string> };
  return required(
    pkg.dependencies[FLY_OVER_WIDGET],
    `${FLY_OVER_WIDGET} missing from package.json`,
  );
}

export function lockfileWidgetVersion(): string {
  const match = lockRaw.match(
    /'@sousa99\/fly-over-tracker-components':\n\s+specifier:\s+\S+\n\s+version:\s+(\S+)/,
  );
  if (!match) throw new Error('fly-over-tracker-components not found in pnpm-lock.yaml');
  const version = required(match[1], 'fly-over-tracker-components version missing');
  return version.split('(')[0] ?? version;
}

export function composeBackendDefaults(): string[] {
  const matches = [
    ...composeRaw.matchAll(
      /ghcr\.io\/sousa99\/fly-over-tracker-backend:\$\{HSH_FLY_OVER_TRACKER_BACKEND_VERSION:-([^}]+)\}/g,
    ),
  ];
  return matches.map((match) => required(match[1], 'backend image default missing'));
}

export function envBackendVersion(): string {
  const match = envRaw.match(/^HSH_FLY_OVER_TRACKER_BACKEND_VERSION=(\S+)/m);
  if (!match) throw new Error('HSH_FLY_OVER_TRACKER_BACKEND_VERSION not found in .env.example');
  return required(match[1], 'backend env version missing');
}

export function documentedFlyOverPins(): { components: string; backend: string } {
  const match = docsRaw.match(/^\|\s*fly-over-tracker\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/m);
  if (!match) throw new Error('fly-over-tracker row not found in docs/versions.md');
  return {
    components: required(match[1], 'components pin missing'),
    backend: required(match[2], 'backend pin missing'),
  };
}
