import { ClosestAircraftCard } from '@sousa99/fly-over-tracker-components';
import type { FlightsConfig } from '../config';

export function ClosestFlightBlock({
  config,
  baseUrl,
}: {
  config: FlightsConfig;
  baseUrl: string;
}) {
  return (
    <ClosestAircraftCard
      location={config.location}
      autoRefresh={config.autoRefresh}
      baseUrl={baseUrl}
    />
  );
}
