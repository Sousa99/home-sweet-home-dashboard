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
      <header className="flex items-center gap-2 text-ink">
        <Bus className="h-5 w-5 text-accent" aria-hidden="true" />
        <h2 className="font-display text-base font-black uppercase tracking-wider">Bus</h2>
      </header>
      {config.stops.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-brutal border-brutal bg-surface-alt p-4 text-center">
          <p className="text-sm font-medium text-ink-muted">No stops configured</p>
          <p className="text-xs text-ink-muted">
            Add stops to <code className="rounded-brutal bg-surface px-1">bus.stops</code> in{' '}
            <code className="rounded-brutal bg-surface px-1">public/config.json</code>.
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
