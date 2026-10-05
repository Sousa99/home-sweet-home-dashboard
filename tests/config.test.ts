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
    expect(config.clock.align).toBe('right');
    expect(config.bus.stops).toEqual([{ id: '1001', name: 'Casal do Canas' }]);
    expect(config.tasks.refreshRateMs).toBe(30000);
    expect(config.placeholders).toHaveLength(0);
    vi.unstubAllGlobals();
  });
});

describe('tasks config', () => {
  it('defaults to the subtle slide-up animation with an extended duration', () => {
    expect(DEFAULT_CONFIG.tasks.transitionVariant).toBe('slide-up');
    expect(DEFAULT_CONFIG.tasks.slideDurationMs).toBe(750);
  });

  it('deep-merges task animation overrides', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tasks: { transitionVariant: 'slide', slideDurationMs: 300 } }),
      }),
    );
    const config = await loadConfig();
    expect(config.tasks.transitionVariant).toBe('slide');
    expect(config.tasks.slideDurationMs).toBe(300);
    vi.unstubAllGlobals();
  });
});

describe('weather config', () => {
  it('provides a Lisbon-area default with a 15-minute refresh', () => {
    expect(DEFAULT_CONFIG.weather.location).toMatchObject({
      name: 'Camarate',
      timezone: 'Europe/Lisbon',
      country: 'Portugal',
    });
    expect(DEFAULT_CONFIG.weather.refetchIntervalMs).toBe(900000);
  });

  it('deep-merges partial weather overrides into the defaults', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ weather: { refetchIntervalMs: 600000 } }),
      }),
    );
    const config = await loadConfig();
    expect(config.weather.refetchIntervalMs).toBe(600000);
    expect(config.weather.location.name).toBe('Camarate');
    vi.unstubAllGlobals();
  });

  it('keeps default location fields when the override supplies only a name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          weather: {
            location: {
              id: 2,
              name: 'Porto',
              latitude: 41.15,
              longitude: -8.61,
              timezone: 'Europe/Lisbon',
            },
          },
        }),
      }),
    );
    const config = await loadConfig();
    expect(config.weather.location.name).toBe('Porto');
    expect(config.weather.location.country).toBe('Portugal');
    vi.unstubAllGlobals();
  });

  it('falls back to defaults on invalid weather input', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => null }));
    const config = await loadConfig();
    expect(config.weather).toEqual(DEFAULT_CONFIG.weather);
    vi.unstubAllGlobals();
  });
});
