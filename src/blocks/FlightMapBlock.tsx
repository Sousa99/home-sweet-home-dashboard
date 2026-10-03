import { FlyOverMapCard } from '@sousa99/fly-over-tracker-components';
import type { FlightsConfig } from '../config';

export function FlightMapBlock({ config, baseUrl }: { config: FlightsConfig; baseUrl: string }) {
  return (
    <FlyOverMapCard
      location={config.location}
      autoRefresh={config.autoRefresh}
      baseUrl={baseUrl}
      className="h-full w-full"
    />
  );
}
