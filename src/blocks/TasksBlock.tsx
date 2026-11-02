import { TaskDeckWrapper } from '@sousa99/procrastinator-tracker-components';
import { ListTodo } from 'lucide-react';
import type { TasksConfig } from '../config';

export function TasksBlock({
  config,
  baseUrl,
  compact = false,
}: {
  config: TasksConfig;
  baseUrl: string;
  compact?: boolean;
}) {
  return (
    <section className="flex w-full shrink-0 flex-col gap-3" aria-label="Tasks">
      <header className="flex items-center gap-2 text-ink">
        <ListTodo className="h-5 w-5 text-accent" aria-hidden="true" />
        <h2 className="font-display text-base font-black uppercase tracking-wider">Tasks</h2>
      </header>
      <TaskDeckWrapper
        filters={config.filters}
        refreshRateMs={config.refreshRateMs}
        baseUrl={baseUrl}
        autoRotateMs={config.autoRotateMs}
        transitionVariant={config.transitionVariant}
        slideDurationMs={config.slideDurationMs}
        className="w-full"
        style={compact ? { '--deck-height': '12rem' } : undefined}
      />
    </section>
  );
}
