import { ClosestAircraftCard, FlyOverWidget } from '@sousa99/fly-over-tracker-components';
import { Plane } from 'lucide-react';
import type { FlightsConfig } from '../config';

export function FlightsBlock({ config, baseUrl }: { config: FlightsConfig; baseUrl: string }) {
  return (
    <section
      className="flex h-full w-full flex-col gap-3 overflow-hidden"
      aria-label="Flights overhead"
    >
      <header className="flex items-center gap-2 text-slate-700">
        <Plane className="h-5 w-5 text-amber-600" aria-hidden="true" />
        <h2 className="text-base font-semibold uppercase tracking-wider">Flights</h2>
      </header>
      <ClosestAircraftCard
        location={config.location}
        autoRefresh={config.autoRefresh}
        baseUrl={baseUrl}
      />
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl">
        <FlyOverWidget
          location={config.location}
          autoRefresh={config.autoRefresh}
          baseUrl={baseUrl}
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
