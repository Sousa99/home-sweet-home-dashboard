import { StopCard } from '@sousa99/bus-catcher-components';
import { Bus } from 'lucide-react';
import type { BusConfig } from '../config';

export function BusBlock({
  config,
  baseUrl,
  compact = false,
}: {
  config: BusConfig;
  baseUrl: string;
  compact?: boolean;
}) {
  const compactLimit = 2;
  return (
    <section className="flex h-full w-full flex-col gap-3 overflow-hidden" aria-label="Bus stops">
      <header className="flex items-center gap-2 text-slate-700">
        <Bus className="h-5 w-5 text-amber-600" aria-hidden="true" />
        <h2 className="text-base font-semibold uppercase tracking-wider">Bus</h2>
      </header>
      {config.stops.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400/60 bg-amber-100/40 p-4 text-center">
          <p className="text-sm font-medium text-slate-600">No stops configured</p>
          <p className="text-xs text-slate-500">
            Add stops to <code className="rounded bg-amber-100 px-1">bus.stops</code> in{' '}
            <code className="rounded bg-amber-100 px-1">public/config.json</code>.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {config.stops.map((stop) => (
            <StopCard
              key={stop.id}
              stopId={stop.id}
              stopName={stop.name}
              lines={stop.lines}
              limit={compact ? Math.min(stop.limit ?? 5, compactLimit) : (stop.limit ?? 5)}
              refetchIntervalMs={stop.refetchIntervalMs ?? 15000}
              baseUrl={baseUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}
