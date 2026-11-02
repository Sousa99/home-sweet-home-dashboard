import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ResolvedTheme, ThemePreference } from './useTheme';

const OPTIONS: { value: ThemePreference; label: string; Icon: LucideIcon }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

export function ThemeControl({
  preference,
  resolved,
  onChange,
  compact = false,
}: {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  onChange: (preference: ThemePreference) => void;
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={`Appearance (${resolved} now)`}
      className="inline-flex items-stretch rounded-brutal border-brutal bg-surface p-0.5 shadow-brutal"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={value === 'system' ? `${label} (currently ${resolved})` : label}
            onClick={() => onChange(value)}
            className={[
              'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-brutal px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline',
              active
                ? 'bg-accent text-accent-ink'
                : 'text-ink-muted hover:bg-surface-alt hover:text-ink',
            ].join(' ')}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={compact ? 'sr-only' : 'hidden sm:inline'}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
