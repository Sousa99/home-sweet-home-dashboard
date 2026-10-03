import { useEffect, useState } from 'react';
import { checkAllModules, type ModuleStatus } from '../lib/status';

export function StatusBlock({ intervalMs }: { intervalMs: number }) {
  const [statuses, setStatuses] = useState<ModuleStatus[]>([]);
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      const results = await checkAllModules();
      if (!active) return;
      setStatuses(results);
      setLastChecked(Date.now());
    };
    void tick();
    const id = window.setInterval(tick, Math.max(intervalMs, 5000));
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return (
    <footer
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2"
      aria-label="Module status"
    >
      <span className="text-sm font-semibold uppercase tracking-wider text-slate-600">System</span>
      <ul className="flex items-center gap-6">
        {statuses.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${s.up ? 'bg-emerald-500' : 'bg-rose-500'}`}
              role="status"
              aria-label={`${s.label} ${s.up ? 'online' : 'offline'}`}
            />
            <span className={`text-sm font-medium ${s.up ? 'text-slate-700' : 'text-rose-600'}`}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>
      <span className="text-xs text-slate-400">
        {lastChecked === null
          ? 'Checking…'
          : `Checked ${new Date(lastChecked).toLocaleTimeString()}`}
      </span>
    </footer>
  );
}
