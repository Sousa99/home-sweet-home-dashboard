import { useLayoutEffect, useState } from 'react';

export type ViewportClass = 'phone' | 'tablet' | 'desktop' | 'tv';

const PHONE_MAX_WIDTH = 640;
const TABLET_MAX_WIDTH = 1024;
const TV_MIN_WIDTH = 1920;
const SHORT_LANDSCAPE_MAX_HEIGHT = 440;

const MEDIA_QUERIES = [
  `(max-width: ${PHONE_MAX_WIDTH - 1}px)`,
  `(orientation: landscape) and (max-height: ${SHORT_LANDSCAPE_MAX_HEIGHT - 1}px)`,
  `(min-width: ${PHONE_MAX_WIDTH}px) and (max-width: ${TABLET_MAX_WIDTH - 1}px)`,
  `(min-width: ${TABLET_MAX_WIDTH}px) and (max-width: ${TV_MIN_WIDTH - 1}px)`,
  `(min-width: ${TV_MIN_WIDTH}px)`,
];

/**
 * Classify the usable viewport. Width is authoritative, except that a short
 * landscape window (a rotated phone) stays in the phone class.
 */
export function resolveViewportClass(
  width: number,
  height: number,
  isLandscape = width > height,
): ViewportClass {
  if (width < PHONE_MAX_WIDTH) return 'phone';
  if (isLandscape && height < SHORT_LANDSCAPE_MAX_HEIGHT) return 'phone';
  if (width < TABLET_MAX_WIDTH) return 'tablet';
  if (width < TV_MIN_WIDTH) return 'desktop';
  return 'tv';
}

function readViewportClass(): ViewportClass {
  if (typeof window === 'undefined') return 'tv';
  return resolveViewportClass(window.innerWidth, window.innerHeight);
}

/**
 * Track the active viewport class and expose it on `<html>` as
 * `data-viewport` for the layout CSS. Uses `useLayoutEffect` so the attribute
 * is applied before paint on the first render.
 */
export function useViewportClass(): ViewportClass {
  const [viewportClass, setViewportClass] = useState<ViewportClass>(readViewportClass);

  useLayoutEffect(() => {
    const update = () => setViewportClass(readViewportClass());

    update();

    const mediaQueries =
      typeof window.matchMedia === 'function'
        ? MEDIA_QUERIES.map((query) => window.matchMedia(query))
        : [];
    for (const mediaQuery of mediaQueries) {
      mediaQuery.addEventListener('change', update);
    }
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      for (const mediaQuery of mediaQueries) {
        mediaQuery.removeEventListener('change', update);
      }
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.viewport = viewportClass;
  }, [viewportClass]);

  return viewportClass;
}
