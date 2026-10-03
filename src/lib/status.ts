export type ModuleKey = 'bus' | 'tasks' | 'fly';

export interface ModuleStatus {
  key: ModuleKey;
  label: string;
  up: boolean;
  checkedAt: number;
}

export interface LocationQuery {
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface CheckOptions {
  /** Timeout in ms for a single probe. */
  timeoutMs?: number;
  /**
   * The fly-over query to probe. Using the dashboard's configured location
   * reuses the backend snapshot cache, so the status check does not trigger an
   * extra adsb.lol feed call (which would add rate-limit pressure).
   */
  flyLocation?: LocationQuery;
}

export const MODULE_KEYS: ModuleKey[] = ['bus', 'tasks', 'fly'];

const LABELS: Record<ModuleKey, string> = {
  bus: 'Bus',
  tasks: 'Tasks',
  fly: 'Flights',
};

const PROBE_PATHS: Record<ModuleKey, string> = {
  bus: '/api/bus/api/health',
  tasks: '/api/tasks/health',
  fly: '/api/fly/api/fly-overs',
};

function flyProbeUrl(location?: LocationQuery): string {
  if (location) {
    return `${PROBE_PATHS.fly}?lat=${location.lat}&lng=${location.lng}&radiusKm=${location.radiusKm}`;
  }
  return `${PROBE_PATHS.fly}?lat=0&lng=0&radiusKm=1`;
}

/** A backend is considered reachable when it answers 2xx-4xx. */
export function isUp(status: number): boolean {
  return status >= 200 && status < 500;
}

export async function checkModule(
  key: ModuleKey,
  options: CheckOptions = {},
): Promise<ModuleStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);
  try {
    const url = key === 'fly' ? flyProbeUrl(options.flyLocation) : PROBE_PATHS[key];
    const res = await fetch(url, { signal: controller.signal });
    return { key, label: LABELS[key], up: isUp(res.status), checkedAt: Date.now() };
  } catch {
    return { key, label: LABELS[key], up: false, checkedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkAllModules(
  flyLocation?: LocationQuery,
  timeoutMs = 5000,
): Promise<ModuleStatus[]> {
  return Promise.all(MODULE_KEYS.map((key) => checkModule(key, { timeoutMs, flyLocation })));
}
