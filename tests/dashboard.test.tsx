import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardConfig } from '../src/config';
import { DEFAULT_CONFIG } from '../src/config';
import { DashboardGrid } from '../src/layout/DashboardGrid';

vi.mock('@sousa99/bus-catcher-components', () => ({
  StopCard: () => <div data-testid="stop-card" />,
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
