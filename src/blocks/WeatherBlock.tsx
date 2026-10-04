import { CurrentWeatherCard } from '@sousa99/weather-psychic-components';
import { CloudSun } from 'lucide-react';
import type { WeatherConfig } from '../config';

export function WeatherBlock({ config, baseUrl }: { config: WeatherConfig; baseUrl: string }) {
  return (
    <section className="flex h-full w-full flex-col gap-3 overflow-hidden" aria-label="Weather">
      <header className="flex items-center gap-2 text-slate-700">
        <CloudSun className="h-5 w-5 text-amber-600" aria-hidden="true" />
        <h2 className="text-base font-semibold uppercase tracking-wider">Weather</h2>
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
