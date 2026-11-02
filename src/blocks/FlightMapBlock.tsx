import { FlyOverMapCard } from '@sousa99/fly-over-tracker-components';
import type { FlightsConfig } from '../config';
import type { ResolvedTheme } from '../theme/useTheme';

export function FlightMapBlock({
  config,
  baseUrl,
  resolved,
}: {
  config: FlightsConfig;
  baseUrl: string;
  resolved: ResolvedTheme;
}) {
  const tiles = config.tileLayers[resolved];
  return (
    <FlyOverMapCard
      location={config.location}
      autoRefresh={config.autoRefresh}
      baseUrl={baseUrl}
      tileUrl={tiles.url}
      tileAttribution={tiles.attribution}
      debug={config.debugMap}
      className="h-full w-full"
    />
  );
}
