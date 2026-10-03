import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG, loadConfig } from '../src/config';

describe('loadConfig', () => {
  it('returns the default config when /config.json is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const config = await loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
    vi.unstubAllGlobals();
  });

  it('returns defaults when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const config = await loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
    vi.unstubAllGlobals();
  });

  it('returns defaults when the body is not an object', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => null }));
    const config = await loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
    vi.unstubAllGlobals();
  });

  it('deep-merges partial overrides into the defaults', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          clock: { defaultFormat: '12h' },
          bus: { stops: [{ id: '1001', name: 'Casal do Canas' }] },
        }),
      }),
    );
    const config = await loadConfig();
    expect(config.clock.defaultFormat).toBe('12h');
    expect(config.clock.switchable).toBe(false);
    expect(config.bus.stops).toEqual([{ id: '1001', name: 'Casal do Canas' }]);
    expect(config.tasks.refreshRateMs).toBe(30000);
    expect(config.placeholders).toHaveLength(3);
    vi.unstubAllGlobals();
  });
});
