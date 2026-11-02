import { useEffect, useState } from 'react';
import type { DashboardConfig } from './config';
import { loadConfig } from './config';
import { DashboardGrid } from './layout/DashboardGrid';

function LoadingShell() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3 rounded-brutal border-brutal bg-surface px-6 py-5 shadow-brutal">
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
        <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">
          Loading dashboard…
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);

  useEffect(() => {
    let active = true;
    void loadConfig().then((resolved) => {
      if (active) setConfig(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  if (config === null) return <LoadingShell />;
  return <DashboardGrid config={config} />;
}
