import type { LayoutConfig } from '../config';
import {
  ALL_BLOCKS,
  DEFAULT_BLOCK_ORDER,
  TABLET_BLOCK_ORDER,
  isBlockId,
  type BlockId,
} from './blocks';
import type { ViewportClass } from './useViewportClass';

export interface ResolvedLayout {
  order: BlockId[];
  hidden: BlockId[];
  scroll: boolean;
  compact: boolean;
}

/**
 * Keep only known, unique block ids. Returns `null` for non-array input so the
 * caller can fall back to its default.
 */
export function sanitizeBlockOrder(value: unknown): BlockId[] | null {
  if (!Array.isArray(value)) return null;
  const out: BlockId[] = [];
  for (const item of value) {
    if (isBlockId(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

function resolveHidden(value: unknown): BlockId[] {
  const hidden = sanitizeBlockOrder(value) ?? [];
  return hidden.length >= ALL_BLOCKS.length ? [] : hidden;
}

/**
 * Resolve the layout for a viewport class. Desktop and TV are authoritative:
 * they always render every block in the fixed order and never scroll, so the
 * wall display cannot be changed by small-screen config.
 */
export function resolveLayout(layout: LayoutConfig, viewportClass: ViewportClass): ResolvedLayout {
  if (viewportClass === 'desktop' || viewportClass === 'tv') {
    return {
      order: [...DEFAULT_BLOCK_ORDER],
      hidden: [],
      scroll: false,
      compact: false,
    };
  }

  if (viewportClass === 'tablet') {
    return {
      order: [...TABLET_BLOCK_ORDER],
      hidden: resolveHidden(layout.hiddenOnTablet),
      scroll: true,
      compact: false,
    };
  }

  const configured = sanitizeBlockOrder(layout.phoneOrder) ?? [];
  const order = [...configured];
  for (const id of DEFAULT_BLOCK_ORDER) {
    if (!order.includes(id)) order.push(id);
  }

  return {
    order,
    hidden: resolveHidden(layout.hiddenOnPhone),
    scroll: true,
    compact: true,
  };
}
