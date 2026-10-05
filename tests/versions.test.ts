import { describe, expect, it } from 'vitest';
import {
  composeBackendDefaults,
  documentedFlyOverPins,
  envBackendVersion,
  lockfileWidgetVersion,
  widgetSpecifier,
} from './helpers/declarations';

const TARGET_VERSION = '0.5.0';

describe('flight-scanner widget version', () => {
  it('declares the target caret range in package.json', () => {
    expect(widgetSpecifier()).toBe(`^${TARGET_VERSION}`);
  });

  it('resolves the target version in pnpm-lock.yaml', () => {
    expect(lockfileWidgetVersion()).toBe(TARGET_VERSION);
  });
});

describe('flight-scanner backend version', () => {
  it('defaults both compose services to the target version', () => {
    expect(composeBackendDefaults()).toEqual([TARGET_VERSION, TARGET_VERSION]);
  });

  it('defaults the env override to the target version', () => {
    expect(envBackendVersion()).toBe(TARGET_VERSION);
  });
});

describe('flight-scanner documentation pins', () => {
  it('matches the declared widget and backend versions', () => {
    expect(documentedFlyOverPins()).toEqual({
      components: `^${TARGET_VERSION}`,
      backend: TARGET_VERSION,
    });
  });
});
