import type { RefreshRate } from '@sousa99/fly-over-tracker-components';
import type { TaskFilters } from '@sousa99/procrastinator-tracker-components';
import type { Location as WeatherLocation } from '@sousa99/weather-psychic-components';

export type ClockFormat = '12h' | '24h';

export interface ClockConfig {
  defaultFormat: ClockFormat;
  switchable: boolean;
}

export interface BusStopConfig {
  id: string;
  name: string;
  lines?: string[];
  limit?: number;
  refetchIntervalMs?: number;
}

export interface BusConfig {
  stops: BusStopConfig[];
}

export interface FlightsConfig {
  location: { lat: number; lng: number; radiusKm: number };
  autoRefresh: RefreshRate;
  maxResults: number;
  /** Log the map's measured size/zoom/fits and tile load/error totals to the console. */
  debugMap: boolean;
}

export interface TasksConfig {
  filters: TaskFilters;
  refreshRateMs: number;
  autoRotateMs: number;
}

export interface StatusConfig {
  intervalMs: number;
}

export interface WeatherConfig {
  /** The place whose current + hourly and weekly weather is shown. */
  location: WeatherLocation;
  /** Auto-refresh cadence in ms; `0` disables. */
  refetchIntervalMs: number;
  /** Maximum number of days shown in the weekly forecast. */
  maxDays: number;
}

export interface PlaceholderConfig {
  title: string;
  description: string;
}

export interface DashboardConfig {
  clock: ClockConfig;
  bus: BusConfig;
  flights: FlightsConfig;
  tasks: TasksConfig;
  weather: WeatherConfig;
  status: StatusConfig;
  placeholders: PlaceholderConfig[];
}

export const DEFAULT_CONFIG: DashboardConfig = {
  clock: { defaultFormat: '24h', switchable: false },
  bus: { stops: [] },
  flights: {
    location: { lat: 38.7223, lng: -9.1393, radiusKm: 100 },
    autoRefresh: 30,
    maxResults: 5,
    debugMap: false,
  },
  tasks: { filters: { finished: false }, refreshRateMs: 30000, autoRotateMs: 4000 },
  weather: {
    location: {
      id: 1,
      name: 'Camarate',
      latitude: 38.7223,
      longitude: -9.1393,
      timezone: 'Europe/Lisbon',
      country: 'Portugal',
    },
    refetchIntervalMs: 900000,
    maxDays: 5,
  },
  status: { intervalMs: 30000 },
  placeholders: [
    { title: 'Energy', description: 'Household power and consumption.' },
    { title: 'Media', description: 'Now playing and upcoming releases.' },
  ],
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      out[key] = mergeDeep(current, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

/**
 * Load and validate the runtime dashboard config from `/config.json`, deep
 * merged over the built-in defaults. Never throws; on any failure the
 * defaults are used unchanged.
 */
export async function loadConfig(url = '/config.json'): Promise<DashboardConfig> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return DEFAULT_CONFIG;
    const data = (await res.json()) as unknown;
    return mergeDeep(DEFAULT_CONFIG, data);
  } catch {
    return DEFAULT_CONFIG;
  }
}
