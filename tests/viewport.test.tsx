import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resolveViewportClass, useViewportClass } from '../src/layout/useViewportClass';
import { installMatchMedia, setViewport } from './helpers/matchMedia';

describe('resolveViewportClass', () => {
  it.each([
    [320, 568, 'phone'],
    [390, 844, 'phone'],
    [639, 800, 'phone'],
    [640, 800, 'tablet'],
    [768, 1024, 'tablet'],
    [1023, 768, 'tablet'],
    [1024, 768, 'desktop'],
    [1440, 900, 'desktop'],
    [1919, 1080, 'desktop'],
    [1920, 1080, 'tv'],
    [3840, 2160, 'tv'],
  ])('classifies %ix%i as %s', (width, height, expected) => {
    expect(resolveViewportClass(width, height)).toBe(expected);
  });

  it('treats a short landscape phone as a phone even when wide', () => {
    expect(resolveViewportClass(844, 390)).toBe('phone');
    expect(resolveViewportClass(1024, 400)).toBe('phone');
  });

  it('does not treat a short landscape window as a phone above the height floor', () => {
    expect(resolveViewportClass(900, 480)).toBe('tablet');
    expect(resolveViewportClass(720, 450)).toBe('tablet'); // 1440x900 at 200% zoom
  });
});

function Probe() {
  const viewportClass = useViewportClass();
  return <span data-testid="class">{viewportClass}</span>;
}

describe('useViewportClass', () => {
  beforeEach(() => {
    installMatchMedia();
    setViewport(1024, 768);
  });

  it('reads the initial viewport class', () => {
    setViewport(390, 844);
    render(<Probe />);
    expect(screen.getByTestId('class')).toHaveTextContent('phone');
    expect(document.documentElement.dataset.viewport).toBe('phone');
  });

  it('updates on resize and orientation changes', () => {
    setViewport(390, 844);
    render(<Probe />);

    act(() => setViewport(768, 1024));
    expect(screen.getByTestId('class')).toHaveTextContent('tablet');

    act(() => setViewport(1920, 1080));
    expect(screen.getByTestId('class')).toHaveTextContent('tv');
    expect(document.documentElement.dataset.viewport).toBe('tv');
  });

  it('does not throw when listeners fire after unmount', () => {
    setViewport(390, 844);
    const { unmount } = render(<Probe />);
    unmount();
    expect(() => act(() => setViewport(1920, 1080))).not.toThrow();
  });
});
