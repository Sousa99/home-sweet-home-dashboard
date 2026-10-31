/** Stable identifiers for the orderable dashboard blocks. */
export type BlockId = 'weather' | 'bus' | 'tasks' | 'flights' | 'map' | 'status';

export const ALL_BLOCKS: readonly BlockId[] = [
  'weather',
  'bus',
  'tasks',
  'flights',
  'map',
  'status',
];

/** Default priority order on phone, after the clock/date header. */
export const DEFAULT_BLOCK_ORDER: readonly BlockId[] = [
  'bus',
  'weather',
  'tasks',
  'flights',
  'map',
  'status',
];

/** Fixed block order used by the tablet arrangement. */
export const TABLET_BLOCK_ORDER: readonly BlockId[] = [
  'flights',
  'weather',
  'map',
  'tasks',
  'bus',
  'status',
];

export function isBlockId(value: unknown): value is BlockId {
  return typeof value === 'string' && (ALL_BLOCKS as readonly string[]).includes(value);
}
