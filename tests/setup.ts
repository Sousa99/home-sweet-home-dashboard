import '@testing-library/jest-dom/vitest';

// jsdom does not implement fetch; give tests a deterministic stub so widgets,
// config loading and the status strip degrade to their "offline" states
// instead of throwing against a real network.
if (!globalThis.fetch) {
  globalThis.fetch = (() =>
    Promise.reject(new Error('fetch stubbed offline in tests'))) as typeof fetch;
}

// jsdom does not implement matchMedia. Default to a desktop-shaped viewport so
// existing tests keep the original three-column layout unless they opt into a
// different viewport with tests/helpers/matchMedia.ts.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}
