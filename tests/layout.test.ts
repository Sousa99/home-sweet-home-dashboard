import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../src/config';
import { resolveLayout, sanitizeBlockOrder } from '../src/layout/layout';

describe('sanitizeBlockOrder', () => {
  it('returns null for non-array input', () => {
    expect(sanitizeBlockOrder('bus')).toBeNull();
    expect(sanitizeBlockOrder(undefined)).toBeNull();
  });

  it('drops unknown ids and de-duplicates', () => {
    expect(sanitizeBlockOrder(['nope', 'bus', 'bus', 'weather'])).toEqual(['bus', 'weather']);
  });

  it('accepts an empty array', () => {
    expect(sanitizeBlockOrder([])).toEqual([]);
  });
});

describe('resolveLayout', () => {
  it('uses the default order and compact scrolling for phones', () => {
    const plan = resolveLayout(DEFAULT_CONFIG.layout, 'phone');
    expect(plan.order).toEqual(['bus', 'weather', 'tasks', 'flights', 'map', 'status']);
    expect(plan.hidden).toEqual([]);
    expect(plan.scroll).toBe(true);
    expect(plan.compact).toBe(true);
  });

  it('appends blocks missing from a custom phone order', () => {
    const plan = resolveLayout(
      { ...DEFAULT_CONFIG.layout, phoneOrder: ['weather', 'bus'] },
      'phone',
    );
    expect(plan.order).toEqual(['weather', 'bus', 'tasks', 'flights', 'map', 'status']);
  });

  it('removes unknown and duplicate ids from the phone order', () => {
    const plan = resolveLayout(
      {
        ...DEFAULT_CONFIG.layout,
        phoneOrder: ['nope', 'tasks', 'tasks', 'bus'] as never,
      },
      'phone',
    );
    expect(plan.order).toEqual(['tasks', 'bus', 'weather', 'flights', 'map', 'status']);
  });

  it('honors hidden blocks on phone', () => {
    const plan = resolveLayout(
      { ...DEFAULT_CONFIG.layout, hiddenOnPhone: ['map', 'status'] },
      'phone',
    );
    expect(plan.hidden).toEqual(['map', 'status']);
    expect(plan.order).toEqual(['bus', 'weather', 'tasks', 'flights', 'map', 'status']);
  });

  it('ignores an all-hidden phone list', () => {
    const plan = resolveLayout(
      {
        ...DEFAULT_CONFIG.layout,
        hiddenOnPhone: ['weather', 'bus', 'tasks', 'flights', 'map', 'status'],
      },
      'phone',
    );
    expect(plan.hidden).toEqual([]);
  });

  it('ignores phone overrides for desktop and tv', () => {
    const layout = {
      ...DEFAULT_CONFIG.layout,
      phoneOrder: ['tasks'] as const,
      hiddenOnPhone: ['bus'] as const,
    };
    for (const viewportClass of ['desktop', 'tv'] as const) {
      const plan = resolveLayout(
        { ...layout, phoneOrder: ['tasks'], hiddenOnPhone: ['bus'] },
        viewportClass,
      );
      expect(plan.order).toEqual(['bus', 'weather', 'tasks', 'flights', 'map', 'status']);
      expect(plan.hidden).toEqual([]);
      expect(plan.scroll).toBe(false);
      expect(plan.compact).toBe(false);
    }
  });

  it('uses the fixed tablet order and honors hiddenOnTablet', () => {
    const plan = resolveLayout(
      { ...DEFAULT_CONFIG.layout, hiddenOnTablet: ['map', 'nope' as never] },
      'tablet',
    );
    expect(plan.order).toEqual(['flights', 'weather', 'map', 'tasks', 'bus', 'status']);
    expect(plan.hidden).toEqual(['map']);
    expect(plan.scroll).toBe(true);
    expect(plan.compact).toBe(false);
  });

  it('ignores an all-hidden tablet list', () => {
    const plan = resolveLayout(
      {
        ...DEFAULT_CONFIG.layout,
        hiddenOnTablet: ['weather', 'bus', 'tasks', 'flights', 'map', 'status'],
      },
      'tablet',
    );
    expect(plan.hidden).toEqual([]);
  });
});
