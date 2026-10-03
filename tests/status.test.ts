import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAllModules, checkModule, isUp } from '../src/lib/status';

describe('isUp', () => {
  it('treats any 2xx-4xx status as reachable', () => {
    expect(isUp(200)).toBe(true);
    expect(isUp(404)).toBe(true);
    expect(isUp(500)).toBe(false);
    expect(isUp(503)).toBe(false);
  });
});

describe('checkModule', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reports up when the probe answers below 500 (404 = backend reachable)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 404 }));
    const result = await checkModule('tasks');
    expect(result.up).toBe(true);
    expect(result.label).toBe('Tasks');
  });

  it('reports down on a 5xx gateway response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 502 }));
    const result = await checkModule('bus');
    expect(result.up).toBe(false);
  });

  it('reports down when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('refused')));
    const result = await checkModule('fly');
    expect(result.up).toBe(false);
  });
});

describe('checkAllModules', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('checks every module', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200 }));
    const results = await checkAllModules();
    expect(results.map((r) => r.key)).toEqual(['bus', 'tasks', 'fly']);
    expect(results.every((r) => r.up)).toBe(true);
  });
});
