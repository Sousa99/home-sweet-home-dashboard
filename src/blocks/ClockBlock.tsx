import { ClockPlain } from '@sousa99/current-time-components';
import type { ClockConfig } from '../config';

export function ClockBlock({ config }: { config: ClockConfig }) {
  return (
    <ClockPlain
      align={config.align}
      defaultFormat={config.defaultFormat}
      switchable={config.switchable}
    />
  );
}
