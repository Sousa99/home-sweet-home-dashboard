import type { ReactNode } from 'react';
import type { DashboardConfig } from '../config';
import type { BlockId } from './blocks';
import { resolveLayout } from './layout';
import { useViewportClass } from './useViewportClass';
import { BusBlock } from '../blocks/BusBlock';
import { ClockBlock } from '../blocks/ClockBlock';
import { FlightMapBlock } from '../blocks/FlightMapBlock';
import { FlightPanelBlock } from '../blocks/FlightPanelBlock';
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

function FlightsHeading() {
  return (
    <header className="flex items-center gap-2 text-slate-700">
      <Plane className="h-5 w-5 text-amber-600" aria-hidden="true" />
      <h2 className="text-base font-semibold uppercase tracking-wider">Flights</h2>
    </header>
  );
}

export function DashboardGrid({ config }: { config: DashboardConfig }) {
  const viewportClass = useViewportClass();
  const plan = resolveLayout(config.layout, viewportClass);
  const compact = plan.compact;
  const hidden = new Set<BlockId>(plan.hidden);

  const blocks: Record<BlockId, ReactNode> = {
    flights: (
      <section
        key="flights"
        data-block="flights"
        className="dashboard-area dashboard-area--flights"
        aria-label="Flights"
      >
        <FlightsHeading />
        <div className="dashboard-area-body">
          <FlightPanelBlock config={config.flights} baseUrl={BASE_URLS.fly} />
        </div>
      </section>
    ),
    weather: (
      <div key="weather" data-block="weather" className="dashboard-area dashboard-area--weather">
        <WeatherBlock config={config.weather} baseUrl={BASE_URLS.weather} compact={compact} />
      </div>
    ),
    map: (
      <section
        key="map"
        data-block="map"
        className="dashboard-area dashboard-area--map"
        aria-label="Flight map"
      >
        <FlightsHeading />
        <div className="dashboard-area-body">
          <FlightMapBlock config={config.flights} baseUrl={BASE_URLS.fly} />
        </div>
      </section>
    ),
    tasks: (
      <div key="tasks" data-block="tasks" className="dashboard-area dashboard-area--tasks">
        <TasksBlock config={config.tasks} baseUrl={BASE_URLS.tasks} compact={compact} />
      </div>
    ),
    bus: (
      <div key="bus" data-block="bus" className="dashboard-area dashboard-area--bus">
        <BusBlock config={config.bus} baseUrl={BASE_URLS.bus} compact={compact} />
      </div>
    ),
    status: (
      <div key="status" data-block="status" className="dashboard-area dashboard-area--status">
        <StatusBlock
          intervalMs={config.status.intervalMs}
          flyLocation={config.flights.location}
          compact={compact}
        />
      </div>
    ),
  };

  const orderedBlocks = plan.order.filter((id) => !hidden.has(id));

  return (
    <main
      className="dashboard-shell"
      data-testid="dashboard-shell"
      data-viewport={viewportClass}
      data-scroll={plan.scroll ? 'true' : 'false'}
    >
      <header className="dashboard-header" role="banner">
        <div className="dashboard-title">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Home Sweet Home</h1>
          <DateReadout />
        </div>
        <div className="dashboard-clock">
          <ClockBlock config={config.clock} />
        </div>
      </header>

      {orderedBlocks.map((id) => blocks[id])}
    </main>
  );
}
