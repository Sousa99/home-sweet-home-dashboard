import { useState } from 'react';
import { CurrentWeatherCard } from '@sousa99/weather-psychic-components';
import { CloudSun } from 'lucide-react';
import type { WeatherConfig } from '../config';

export function WeatherBlock({
  config,
  baseUrl,
  compact = false,
}: {
  config: WeatherConfig;
  baseUrl: string;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={[
        'weather-block flex h-full w-full flex-col overflow-hidden',
        compact ? 'weather-block--compact gap-2' : 'gap-3',
        compact && expanded ? 'weather-block--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Weather"
      data-compact={compact ? 'true' : 'false'}
      data-expanded={compact && expanded ? 'true' : 'false'}
    >
      <header className="flex items-center justify-between gap-2 text-slate-700">
        <div className="flex items-center gap-2">
          <CloudSun className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="text-base font-semibold uppercase tracking-wider">Weather</h2>
        </div>
        {compact && (
          <button
            type="button"
            className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-amber-700"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Less' : 'Details'}
          </button>
        )}
      </header>
      <CurrentWeatherCard
        location={config.location}
        baseUrl={baseUrl}
        refetchIntervalMs={config.refetchIntervalMs}
        className="min-h-0 flex-1"
      />
    </section>
  );
}
