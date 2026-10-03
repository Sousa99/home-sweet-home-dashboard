import '@testing-library/jest-dom/vitest';

// jsdom does not implement fetch; give tests a deterministic stub so widgets,
// config loading and the status strip degrade to their "offline" states
// instead of throwing against a real network.
if (!globalThis.fetch) {
  globalThis.fetch = (() =>
    Promise.reject(new Error('fetch stubbed offline in tests'))) as typeof fetch;
}
