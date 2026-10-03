import { Sparkles } from 'lucide-react';
import type { PlaceholderConfig } from '../config';

export function PlaceholderBlock({ title, description }: PlaceholderConfig) {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-start justify-center gap-2 rounded-xl border border-dashed border-amber-400/60 bg-amber-100/40 p-4"
    >
      <div className="flex items-center gap-2 text-amber-700">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-slate-500">{description}</p>
      <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-amber-600/70">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
        Coming soon
      </span>
    </div>
  );
}
