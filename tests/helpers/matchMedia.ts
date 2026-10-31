type ChangeListener = (event: MediaQueryListEvent) => void;

const listeners = new Map<string, Set<ChangeListener>>();

function ensureMatchMedia(): void {
  if (typeof window.matchMedia === 'function' && 'mockMatchMedia' in window) return;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => {
      const set = listeners.get(query) ?? new Set<ChangeListener>();
      listeners.set(query, set);
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: ChangeListener) => {
          set.add(listener);
        },
        removeEventListener: (_type: string, listener: ChangeListener) => {
          set.delete(listener);
        },
        addListener: (listener: ChangeListener) => {
          set.add(listener);
        },
        removeListener: (listener: ChangeListener) => {
          set.delete(listener);
        },
        dispatchEvent: () => false,
      } as unknown as MediaQueryList;
    },
  });

  Object.defineProperty(window, 'mockMatchMedia', { configurable: true, value: true });
}

/** Install a deterministic matchMedia mock and reset any tracked listeners. */
export function installMatchMedia(): void {
  listeners.clear();
  ensureMatchMedia();
}

/** Resize the simulated viewport and notify resize/orientation/media listeners. */
export function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });

  window.dispatchEvent(new Event('resize'));
  window.dispatchEvent(new Event('orientationchange'));

  for (const set of listeners.values()) {
    for (const listener of set) {
      listener({ matches: false, media: '' } as MediaQueryListEvent);
    }
  }
}
