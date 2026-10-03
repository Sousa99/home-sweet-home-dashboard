import { FlyOverListCard } from '@sousa99/fly-over-tracker-components';
import type { FlightsConfig } from '../config';

export function FlightListBlock({ config, baseUrl }: { config: FlightsConfig; baseUrl: string }) {
  return (
    <FlyOverListCard
      location={config.location}
      autoRefresh={config.autoRefresh}
      baseUrl={baseUrl}
      maxResults={config.maxResults}
      className="h-full w-full"
    />
  );
}
