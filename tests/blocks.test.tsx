import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BusBlock } from '../src/blocks/BusBlock';
import { StatusBlock } from '../src/blocks/StatusBlock';
import { TasksBlock } from '../src/blocks/TasksBlock';
import { WeatherBlock } from '../src/blocks/WeatherBlock';
import { DEFAULT_CONFIG } from '../src/config';

vi.mock('@sousa99/bus-catcher-components', () => ({
  StopCard: ({ limit }: { limit?: number }) => (
    <div data-testid="stop-card" data-limit={String(limit ?? '')} />
  ),
}));

vi.mock('@sousa99/weather-psychic-components', () => ({
  CurrentWeatherCard: () => <div data-testid="current-weather" />,
}));

vi.mock('@sousa99/procrastinator-tracker-components', () => ({
  TaskDeckWrapper: ({ style }: { style?: Record<string, string | number> }) => (
    <div data-testid="task-deck" data-deck-height={String(style?.['--deck-height'] ?? '')} />
  ),
}));

vi.mock('../src/lib/status', () => ({
  checkAllModules: vi.fn().mockResolvedValue([
    { key: 'bus', label: 'Bus', up: true, checkedAt: 0 },
    { key: 'tasks', label: 'Tasks', up: true, checkedAt: 0 },
    { key: 'fly', label: 'Flights', up: true, checkedAt: 0 },
    { key: 'weather', label: 'Weather', up: true, checkedAt: 0 },
  ]),
}));

const busConfig = { stops: [{ id: '1001', name: 'Casal do Canas', limit: 5 }] };

describe('compact block presentation', () => {
  it('caps bus departures at two when compact', () => {
    render(<BusBlock config={busConfig} baseUrl="/api/bus" compact />);
    expect(screen.getByTestId('stop-card')).toHaveAttribute('data-limit', '2');
  });

  it('keeps the configured bus limit when not compact', () => {
    render(<BusBlock config={busConfig} baseUrl="/api/bus" />);
    expect(screen.getByTestId('stop-card')).toHaveAttribute('data-limit', '5');
  });

  it('marks the weather block as compact', () => {
    render(<WeatherBlock config={DEFAULT_CONFIG.weather} baseUrl="/api/weather" compact />);
    expect(screen.getByLabelText('Weather')).toHaveAttribute('data-compact', 'true');
  });

  it('expands the compact weather details on demand', () => {
    render(<WeatherBlock config={DEFAULT_CONFIG.weather} baseUrl="/api/weather" compact />);
    const section = screen.getByLabelText('Weather');
    const details = screen.getByRole('button', { name: 'Details' });
    expect(section).toHaveAttribute('data-expanded', 'false');
    expect(details).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(details);

    expect(section).toHaveAttribute('data-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses the compact task deck height', () => {
    render(<TasksBlock config={DEFAULT_CONFIG.tasks} baseUrl="/api/tasks" compact />);
    expect(screen.getByTestId('task-deck')).toHaveAttribute('data-deck-height', '12rem');
  });

  it('renders a single-line status summary on compact', async () => {
    render(<StatusBlock intervalMs={60000} compact />);
    expect(await screen.findByText('All modules online')).toBeInTheDocument();
    const footer = screen.getByLabelText('Module status');
    expect(footer).toHaveTextContent('Bus online');
  });
});
