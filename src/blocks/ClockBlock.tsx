import { ClockCard } from '@sousa99/current-time-components';
import type { ClockConfig } from '../config';

export function ClockBlock({ config }: { config: ClockConfig }) {
  return (
    <ClockCard align="center" defaultFormat={config.defaultFormat} switchable={config.switchable} />
  );
}
