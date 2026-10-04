import type { DashboardConfig } from '../config';
import { BusBlock } from '../blocks/BusBlock';
import { ClockBlock } from '../blocks/ClockBlock';
import { FlightMapBlock } from '../blocks/FlightMapBlock';
import { FlightPanelBlock } from '../blocks/FlightPanelBlock';
import { PlaceholderBlock } from '../blocks/PlaceholderBlock';
import { StatusBlock } from '../blocks/StatusBlock';
import { TasksBlock } from '../blocks/TasksBlock';
import { WeatherBlock } from '../blocks/WeatherBlock';
import { DateReadout } from '../components/DateReadout';
import { Plane } from 'lucide-react';

/**
 * Same-origin base URLs handed to each module's widget. The nginx / vite
 * proxies strip the /api/<module> prefix and forward to the module backend.
 */
export const BASE_URLS = {
  bus: '/api/bus',
  tasks: '/api/tasks',
  fly: '/api/fly',
  weather: '/api/weather',
} as const;

export function DashboardGrid({ config }: { config: DashboardConfig }) {
  return (
    <div className="grid h-screen w-screen grid-cols-12 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-4 p-6">
      <header className="col-span-12 grid grid-cols-12 items-center gap-4">
        <div className="col-span-9 flex flex-col justify-center gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Home Sweet Home</h1>
          <DateReadout />
        </div>
        <div className="col-span-3 h-24 overflow-hidden rounded-xl border border-amber-500/20 bg-white p-2 shadow-sm">
          <ClockBlock config={config.clock} />
        </div>
      </header>

      <main className="col-span-12 grid min-h-0 grid-cols-12 gap-4">
        <section className="col-span-4 flex min-h-0 flex-col gap-3">
          <header className="flex items-center gap-2 text-slate-700">
            <Plane className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-base font-semibold uppercase tracking-wider">Flights</h2>
          </header>
          <div className="min-h-0 flex-1">
            <FlightPanelBlock config={config.flights} baseUrl={BASE_URLS.fly} />
          </div>
        </section>

        <section className="col-span-4 flex min-h-0 flex-col gap-3">
          <header className="flex items-center gap-2 text-slate-700">
            <Plane className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-base font-semibold uppercase tracking-wider">Flights</h2>
          </header>
          <div className="min-h-0 flex-1">
            <FlightMapBlock config={config.flights} baseUrl={BASE_URLS.fly} />
          </div>
        </section>

        <section className="col-span-4 flex min-h-0 flex-col gap-4">
          <TasksBlock config={config.tasks} baseUrl={BASE_URLS.tasks} />
          <div className="min-h-0 flex-1">
            <BusBlock config={config.bus} baseUrl={BASE_URLS.bus} />
          </div>
        </section>
      </main>

      <section className="col-span-12 grid grid-cols-3 gap-4" aria-label="Modules">
        <WeatherBlock config={config.weather} baseUrl={BASE_URLS.weather} />
        {config.placeholders.map((placeholder) => (
          <PlaceholderBlock
            key={placeholder.title}
            title={placeholder.title}
            description={placeholder.description}
          />
        ))}
      </section>

      <div className="col-span-12">
        <StatusBlock intervalMs={config.status.intervalMs} flyLocation={config.flights.location} />
      </div>
    </div>
  );
}
