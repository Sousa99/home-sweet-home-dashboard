import { useEffect, useState } from 'react';
import type { DashboardConfig } from './config';
import { loadConfig } from './config';
import { DashboardGrid } from './layout/DashboardGrid';

function LoadingShell() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-amber-50">
      <div className="flex flex-col items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
        <p className="text-sm font-medium text-slate-500">Loading dashboard…</p>
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
