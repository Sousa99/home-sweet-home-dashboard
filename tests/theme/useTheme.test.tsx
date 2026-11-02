import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readStoredPreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  useTheme,
} from '../../src/theme/useTheme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function installThemeMatchMedia(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const mql = {
    get matches() {
      return dark;
    },
    media: DARK_QUERY,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      query === DARK_QUERY
        ? mql
        : ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false,
          } as unknown as MediaQueryList),
  });

  return {
    setDark(value: boolean) {
      dark = value;
      for (const listener of listeners) {
        listener({ matches: value, media: DARK_QUERY } as MediaQueryListEvent);
      }
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  installThemeMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

describe('resolveTheme', () => {
  it('resolves System from the device preference', () => {
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('system', true)).toBe('dark');
  });

  it('lets a manual choice win over the device preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('readStoredPreference', () => {
  it('treats absent and invalid values as System', () => {
    expect(readStoredPreference()).toBe('system');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readStoredPreference()).toBe('system');
  });

  it('reads light and dark values', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readStoredPreference()).toBe('dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(readStoredPreference()).toBe('light');
  });

  it('falls back to System when storage throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStoredPreference()).toBe('system');
    getItem.mockRestore();
  });
});

describe('useTheme', () => {
  it('applies the system appearance to the document', () => {
    installThemeMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe('system');
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('persists a manual choice and updates the document', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setPreference('dark'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    act(() => result.current.setPreference('light'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('returns to System by removing the stored key', () => {
    installThemeMatchMedia(true);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setPreference('light'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    act(() => result.current.setPreference('system'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('follows media changes only while in System mode', () => {
    const media = installThemeMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => media.setDark(true));
    expect(result.current.resolved).toBe('dark');

    act(() => result.current.setPreference('light'));
    expect(media.listenerCount()).toBe(0);

    act(() => media.setDark(true));
    expect(result.current.resolved).toBe('light');
  });

  it('syncs the preference across tabs via the storage event', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      window.dispatchEvent(
        new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark' }),
      );
    });

    expect(result.current.preference).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });
});
