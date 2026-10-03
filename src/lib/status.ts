export type ModuleKey = 'bus' | 'tasks' | 'fly';

export interface ModuleStatus {
  key: ModuleKey;
  label: string;
  up: boolean;
  checkedAt: number;
}

export const MODULE_KEYS: ModuleKey[] = ['bus', 'tasks', 'fly'];

const LABELS: Record<ModuleKey, string> = {
  bus: 'Bus',
  tasks: 'Tasks',
  fly: 'Flights',
};

/**
 * Probe paths through the same-origin module proxies (deploy/nginx.conf and
 * the vite dev proxy). Each proxy strips the `/api/<module>` prefix and
 * forwards the remainder, so these mirror each backend's real route:
 * bus `/api/health` → 200, tasks `/health` → 200, fly feed probe → 200.
 * A dead upstream surfaces as a 5xx gateway error.
 */
const STATUS_URLS: Record<ModuleKey, string> = {
  bus: '/api/bus/api/health',
  tasks: '/api/tasks/health',
  fly: '/api/fly/api/fly-overs?lat=0&lng=0&radiusKm=1',
};

/** A backend is considered reachable when it answers 2xx-4xx. */
export function isUp(status: number): boolean {
  return status >= 200 && status < 500;
}

export async function checkModule(key: ModuleKey, timeoutMs = 5000): Promise<ModuleStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(STATUS_URLS[key], { signal: controller.signal });
    return { key, label: LABELS[key], up: isUp(res.status), checkedAt: Date.now() };
  } catch {
    return { key, label: LABELS[key], up: false, checkedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkAllModules(timeoutMs = 5000): Promise<ModuleStatus[]> {
  return Promise.all(MODULE_KEYS.map((key) => checkModule(key, timeoutMs)));
}
