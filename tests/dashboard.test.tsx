import { act, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardConfig } from '../src/config';
import { DEFAULT_CONFIG } from '../src/config';
import { DashboardGrid } from '../src/layout/DashboardGrid';
import { installMatchMedia, setViewport } from './helpers/matchMedia';

vi.mock('@sousa99/bus-catcher-components', () => ({
  StopCard: ({ limit }: { limit?: number }) => (
    <div data-testid="stop-card" data-limit={String(limit ?? '')} />
  ),
}));

vi.mock('@sousa99/current-time-components', () => ({
  ClockPlain: () => <div data-testid="clock-plain" />,
}));

vi.mock('@sousa99/fly-over-tracker-components', () => ({
  FlyOverClosestPanel: () => <div data-testid="flight-panel" />,
  FlyOverMapCard: () => <div data-testid="fly-over-map" />,
}));

vi.mock('@sousa99/procrastinator-tracker-components', () => ({
  TaskDeckWrapper: () => <div data-testid="task-deck" />,
}));

vi.mock('@sousa99/weather-psychic-components', () => ({
  CurrentWeatherCard: () => <div data-testid="current-weather" />,
}));

vi.mock('../src/lib/status', () => ({
  checkAllModules: vi.fn().mockResolvedValue([
    { key: 'bus', label: 'Bus', up: true, checkedAt: 0 },
    { key: 'tasks', label: 'Tasks', up: true, checkedAt: 0 },
    { key: 'fly', label: 'Flights', up: true, checkedAt: 0 },
    { key: 'weather', label: 'Weather', up: true, checkedAt: 0 },
  ]),
}));

describe('DashboardGrid', () => {
  it('renders the dashboard shell and every module block', () => {
    const config: DashboardConfig = {
      ...DEFAULT_CONFIG,
      bus: { stops: [{ id: '1001', name: 'Casal do Canas' }] },
    };
    render(<DashboardGrid config={config} />);

    expect(screen.getByText('Home Sweet Home')).toBeInTheDocument();
    expect(screen.getByTestId('clock-plain')).toBeInTheDocument();
    expect(screen.getByTestId('stop-card')).toBeInTheDocument();
    expect(screen.getByTestId('flight-panel')).toBeInTheDocument();
    expect(screen.getByTestId('fly-over-map')).toBeInTheDocument();
    expect(screen.getByTestId('task-deck')).toBeInTheDocument();
    expect(screen.getByTestId('current-weather')).toBeInTheDocument();
    expect(screen.queryAllByText('Coming soon')).toHaveLength(0);
  });

  it('shows the weather module in the status footer', async () => {
    render(<DashboardGrid config={DEFAULT_CONFIG} />);
    const footer = await screen.findByLabelText('Module status');
    expect(within(footer).getByText('Weather')).toBeInTheDocument();
  });
});

function blockOrder(): (string | null)[] {
  return Array.from(document.querySelectorAll('[data-block]')).map((el) =>
    el.getAttribute('data-block'),
  );
}

const configWithBus: DashboardConfig = {
  ...DEFAULT_CONFIG,
  bus: { stops: [{ id: '1001', name: 'Casal do Canas' }] },
};

describe('responsive layout', () => {
  beforeEach(() => {
    installMatchMedia();
    setViewport(1024, 768);
  });

  it('renders the phone layout in the configured priority order', async () => {
    setViewport(390, 844);
    render(<DashboardGrid config={configWithBus} />);

    const shell = screen.getByTestId('dashboard-shell');
    expect(shell.dataset.viewport).toBe('phone');
    expect(shell.dataset.scroll).toBe('true');

    expect(blockOrder()).toEqual(['bus', 'weather', 'tasks', 'flights', 'map', 'status']);
    expect(screen.getByTestId('stop-card')).toHaveAttribute('data-limit', '2');
    expect(await screen.findByText('All modules online')).toBeInTheDocument();
  });

  it('honors a custom phone order and hidden blocks', () => {
    setViewport(390, 844);
    render(
      <DashboardGrid
        config={{
          ...configWithBus,
          layout: {
            ...DEFAULT_CONFIG.layout,
            phoneOrder: ['weather', 'bus'],
            hiddenOnPhone: ['map'],
          },
        }}
      />,
    );

    expect(blockOrder()).toEqual(['weather', 'bus', 'tasks', 'flights', 'status']);
    expect(screen.queryByTestId('fly-over-map')).not.toBeInTheDocument();
  });

  it('keeps the desktop/TV layout non-scrolling and independent of phone config', () => {
    for (const [width, height, viewportClass] of [
      [1440, 900, 'desktop'],
      [1920, 1080, 'tv'],
      [3840, 2160, 'tv'],
    ] as const) {
      installMatchMedia();
      setViewport(width, height);
      const { unmount } = render(
        <DashboardGrid
          config={{
            ...configWithBus,
            layout: {
              ...DEFAULT_CONFIG.layout,
              phoneOrder: ['tasks'],
              hiddenOnPhone: ['bus'],
            },
          }}
        />,
      );

      const shell = screen.getByTestId('dashboard-shell');
      expect(shell.dataset.viewport).toBe(viewportClass);
      expect(shell.dataset.scroll).toBe('false');
      expect(blockOrder()).toEqual(['bus', 'weather', 'tasks', 'flights', 'map', 'status']);
      expect(screen.getByTestId('stop-card')).toHaveAttribute('data-limit', '5');
      unmount();
    }
  });

  it('renders the tablet two-column order without compact widgets', () => {
    setViewport(768, 1024);
    render(<DashboardGrid config={configWithBus} />);

    const shell = screen.getByTestId('dashboard-shell');
    expect(shell.dataset.viewport).toBe('tablet');
    expect(shell.dataset.scroll).toBe('true');
    expect(blockOrder()).toEqual(['flights', 'weather', 'map', 'tasks', 'bus', 'status']);
    expect(screen.getByTestId('stop-card')).toHaveAttribute('data-limit', '5');
  });

  it('preserves widget DOM nodes across viewport class changes', () => {
    setViewport(390, 844);
    render(<DashboardGrid config={configWithBus} />);
    const taskDeck = screen.getByTestId('task-deck');
    const weather = screen.getByTestId('current-weather');

    act(() => setViewport(1920, 1080));

    expect(screen.getByTestId('dashboard-shell').dataset.viewport).toBe('tv');
    expect(screen.getByTestId('task-deck')).toBe(taskDeck);
    expect(screen.getByTestId('current-weather')).toBe(weather);
  });
});
