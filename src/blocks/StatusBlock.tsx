import { useEffect, useState } from 'react';
import { checkAllModules, type LocationQuery, type ModuleStatus } from '../lib/status';

export function StatusBlock({
  intervalMs,
  flyLocation,
  compact = false,
}: {
  intervalMs: number;
  flyLocation?: LocationQuery;
  compact?: boolean;
}) {
  const [statuses, setStatuses] = useState<ModuleStatus[]>([]);
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      const results = await checkAllModules(flyLocation);
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
  }, [intervalMs, flyLocation]);

  const checkedLabel =
    lastChecked === null ? 'Checking…' : `Checked ${new Date(lastChecked).toLocaleTimeString()}`;

  if (compact) {
    const allUp = statuses.length > 0 && statuses.every((s) => s.up);
    const downCount = statuses.filter((s) => !s.up).length;
    const summary =
      statuses.length === 0
        ? 'Checking…'
        : allUp
          ? 'All modules online'
          : `${downCount} module${downCount === 1 ? '' : 's'} offline`;
    const detail =
      statuses.length === 0
        ? ''
        : statuses.map((s) => `${s.label} ${s.up ? 'online' : 'offline'}`).join(', ');

    return (
      <footer
        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2"
        role="contentinfo"
        aria-label="Module status"
      >
        <span className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              statuses.length === 0 ? 'bg-slate-400' : allUp ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            role="status"
            aria-label={summary}
          />
          <span className="text-sm font-semibold text-slate-600">{summary}</span>
        </span>
        <span className="sr-only">{detail}</span>
        <span className="text-xs text-slate-400">{checkedLabel}</span>
      </footer>
    );
  }

  return (
    <footer
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2"
      role="contentinfo"
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
      <span className="text-xs text-slate-400">{checkedLabel}</span>
    </footer>
  );
}
