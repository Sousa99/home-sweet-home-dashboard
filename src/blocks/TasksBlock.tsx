import { TaskDeckWrapper } from '@sousa99/procrastinator-tracker-components';
import { ListTodo } from 'lucide-react';
import type { TasksConfig } from '../config';

export function TasksBlock({ config, baseUrl }: { config: TasksConfig; baseUrl: string }) {
  return (
    <section className="flex w-full shrink-0 flex-col gap-3" aria-label="Tasks">
      <header className="flex items-center gap-2 text-slate-700">
        <ListTodo className="h-5 w-5 text-amber-600" aria-hidden="true" />
        <h2 className="text-base font-semibold uppercase tracking-wider">Tasks</h2>
      </header>
      <TaskDeckWrapper
        filters={config.filters}
        refreshRateMs={config.refreshRateMs}
        baseUrl={baseUrl}
        autoRotateMs={config.autoRotateMs}
        className="w-full"
      />
    </section>
  );
}
