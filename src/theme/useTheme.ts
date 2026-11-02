import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'hsh.dashboard.theme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

export interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredPreference(): ThemePreference {
  try {
    const value = storage()?.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function systemPrefersDark(): boolean {
  try {
    return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches;
  } catch {
    return false;
  }
}

function persistPreference(preference: ThemePreference): void {
  try {
    const store = storage();
    if (store === null) return;
    if (preference === 'system') store.removeItem(THEME_STORAGE_KEY);
    else store.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage is best-effort: blocked/private storage must never break the UI.
  }
}

export function useTheme(): ThemeState {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [prefersDark, setPrefersDark] = useState<boolean>(systemPrefersDark);

  const resolved = resolveTheme(preference, prefersDark);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  useEffect(() => {
    if (preference !== 'system') return;
    if (typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(DARK_QUERY);
    setPrefersDark(query.matches);

    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }

    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, [preference]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      setPreferenceState(readStoredPreference());
      setPrefersDark(systemPrefersDark());
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    persistPreference(next);
    setPreferenceState(next);
  }, []);

  return { preference, resolved, setPreference };
}
