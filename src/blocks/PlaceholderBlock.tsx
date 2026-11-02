import { Sparkles } from 'lucide-react';
import type { PlaceholderConfig } from '../config';

export function PlaceholderBlock({ title, description }: PlaceholderConfig) {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-start justify-center gap-2 rounded-brutal border-brutal bg-surface-alt p-4"
    >
      <div className="flex items-center gap-2 text-ink">
        <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="font-display text-base font-black uppercase tracking-tight">{title}</h3>
      </div>
      <p className="text-sm text-ink-muted">{description}</p>
      <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
        Coming soon
      </span>
    </div>
  );
}
