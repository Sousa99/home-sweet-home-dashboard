import type { DashboardConfig } from '../config';
import { BusBlock } from '../blocks/BusBlock';
import { ClockBlock } from '../blocks/ClockBlock';
import { FlightsBlock } from '../blocks/FlightsBlock';
import { PlaceholderBlock } from '../blocks/PlaceholderBlock';
import { StatusBlock } from '../blocks/StatusBlock';
import { TasksBlock } from '../blocks/TasksBlock';
import { DateReadout } from '../components/DateReadout';

/**
 * Same-origin base URLs handed to each module's widget. The nginx / vite
 * proxies strip the /api/<module> prefix and forward to the module backend.
 */
export const BASE_URLS = {
  bus: '/api/bus',
  tasks: '/api/tasks',
  fly: '/api/fly',
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
        <section className="col-span-3 min-h-0">
          <BusBlock config={config.bus} baseUrl={BASE_URLS.bus} />
        </section>
        <section className="col-span-6 min-h-0">
          <FlightsBlock config={config.flights} baseUrl={BASE_URLS.fly} />
        </section>
        <section className="col-span-3 min-h-0">
          <TasksBlock config={config.tasks} baseUrl={BASE_URLS.tasks} />
        </section>
      </main>

      <section className="col-span-12 grid grid-cols-3 gap-4" aria-label="Upcoming modules">
        {config.placeholders.map((placeholder) => (
          <PlaceholderBlock
            key={placeholder.title}
            title={placeholder.title}
            description={placeholder.description}
          />
        ))}
      </section>

      <div className="col-span-12">
        <StatusBlock intervalMs={config.status.intervalMs} />
      </div>
    </div>
  );
}
