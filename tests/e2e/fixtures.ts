import type { Page, Route } from '@playwright/test';

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(body),
  });
}

function addMinutes(base: Date, minutes: number): string {
  return new Date(base.getTime() + minutes * 60_000).toISOString();
}

function addHours(base: Date, hours: number): string {
  return new Date(base.getTime() + hours * 3_600_000).toISOString();
}

function addDays(base: Date, days: number): string {
  return new Date(base.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

export function buildFixtures(now = new Date()) {
  const bus = {
    stopId: '376204',
    times: [
      {
        lineId: '2711_0',
        lineShortName: '2711',
        headsign: 'Casal do Canas',
        scheduledAt: addMinutes(now, 3),
        minutesUntil: 3,
        source: 'live',
        predictedAt: addMinutes(now, 3),
        delayMinutes: 0,
      },
      {
        lineId: '2711_0',
        lineShortName: '2711',
        headsign: 'Casal do Canas',
        scheduledAt: addMinutes(now, 12),
        minutesUntil: 12,
        source: 'scheduled',
        delayMinutes: null,
      },
    ],
    realtime: {
      available: true,
      lastUpdate: now.toISOString(),
      liveCount: 1,
      totalCount: 2,
    },
  };

  const hourly = Array.from({ length: 12 }, (_, i) => ({
    time: addHours(now, i),
    temperature: Math.round(18 - i * 0.4),
    weatherCode: i < 4 ? 1 : 3,
    condition: i < 4 ? 'Mainly clear' : 'Overcast',
    precipitationProbability: i < 6 ? 5 : 20,
    isDay: i < 9,
  }));

  const daily = Array.from({ length: 5 }, (_, i) => ({
    date: addDays(now, i + 1),
    weatherCode: i % 2 === 0 ? 1 : 61,
    condition: i % 2 === 0 ? 'Mainly clear' : 'Rain',
    temperatureMin: 12 + i,
    temperatureMax: 21 + i,
    precipitationProbability: i % 2 === 0 ? 10 : 65,
  }));

  const weather = {
    location: {
      id: 1,
      name: 'Camarate',
      latitude: 38.804428,
      longitude: -9.123621,
      timezone: 'Europe/Lisbon',
      country: 'Portugal',
    },
    current: {
      time: now.toISOString(),
      temperature: 18,
      apparentTemperature: 17,
      weatherCode: 1,
      condition: 'Mainly clear',
      humidity: 62,
      windSpeed: 12,
      windDirection: 270,
      precipitationProbability: 5,
      uvIndex: 4,
      isDay: true,
    },
    hourly,
    daily,
    generatedAt: now.toISOString(),
  };

  const aircraft = [
    {
      icao24: '4ca123',
      callsign: 'TP123',
      originAirport: 'LPPT',
      originCity: 'Lisbon',
      originAirportName: 'Humberto Delgado Airport',
      originCountry: 'Portugal',
      destinationAirport: 'LPPR',
      destinationCity: 'Porto',
      destinationAirportName: 'Francisco Sa Carneiro Airport',
      destinationCountry: 'Portugal',
      latitude: 38.79,
      longitude: -9.13,
      altitude: 3200,
      onGround: false,
      velocity: 210,
      trueTrack: 15,
      verticalRate: 7,
      distanceKm: 2.4,
    },
    {
      icao24: '4ca456',
      callsign: 'RYR42',
      originAirport: 'LEMD',
      originCity: 'Madrid',
      originAirportName: 'Adolfo Suarez Madrid-Barajas Airport',
      originCountry: 'Spain',
      destinationAirport: 'LPPT',
      destinationCity: 'Lisbon',
      destinationAirportName: 'Humberto Delgado Airport',
      destinationCountry: 'Portugal',
      latitude: 38.83,
      longitude: -9.08,
      altitude: 2400,
      onGround: false,
      velocity: 190,
      trueTrack: 200,
      verticalRate: -5,
      distanceKm: 4.1,
    },
  ];

  const fly = {
    center: { lat: 38.804428, lng: -9.123621 },
    radiusKm: 5,
    asOf: Math.floor(now.getTime() / 1000),
    count: aircraft.length,
    destinationEnrichment: 'complete',
    aircraft,
  };

  const tasks = [
    {
      id: 1,
      title: 'Take the recycling out',
      description: 'Paper and plastic bins before the evening pickup.',
      status: 'started',
      location: 'Kitchen',
      urgency: 3,
      dueDate: addHours(now, 6),
      parentTaskId: null,
      recurrence: null,
      tags: ['home'],
      assignees: [{ id: 1, name: 'Household' }],
      comments: [],
      createdAt: addDays(now, -2) + 'T09:00:00.000Z',
      updatedAt: now.toISOString(),
    },
    {
      id: 2,
      title: 'Water the balcony plants',
      description: null,
      status: 'in-progress',
      location: 'Balcony',
      urgency: 2,
      dueDate: null,
      parentTaskId: null,
      recurrence: { frequency: 'weekly', interval: 1 },
      tags: ['plants'],
      assignees: [],
      comments: [],
      createdAt: addDays(now, -5) + 'T09:00:00.000Z',
      updatedAt: now.toISOString(),
    },
    {
      id: 3,
      title: 'Book the boiler service',
      description: 'Annual maintenance, any weekday morning.',
      status: 'to-start',
      location: null,
      urgency: 4,
      dueDate: addDays(now, 4) + 'T12:00:00.000Z',
      parentTaskId: null,
      recurrence: null,
      tags: ['maintenance'],
      assignees: [],
      comments: [],
      createdAt: addDays(now, -1) + 'T09:00:00.000Z',
      updatedAt: now.toISOString(),
    },
  ];

  return { bus, weather, fly, tasks };
}

/** Mock every module API the widgets call, plus external map tiles. */
export async function installApiMocks(page: Page): Promise<void> {
  const fixtures = buildFixtures();

  await page.route('**/api/**', async (route) => {
    const { pathname } = new URL(route.request().url());

    if (pathname.endsWith('/health')) {
      return json(route, { status: 'ok' });
    }
    if (pathname.includes('/stops/') && pathname.endsWith('/times')) {
      return json(route, fixtures.bus);
    }
    if (pathname.endsWith('/api/weather')) {
      return json(route, fixtures.weather);
    }
    if (pathname.endsWith('/api/fly-overs')) {
      return json(route, fixtures.fly);
    }
    if (pathname.endsWith('/api/tasks')) {
      return json(route, fixtures.tasks);
    }

    return json(route, { error: 'not_mocked', pathname }, 404);
  });

  await page.route(/openstreetmap|cartocdn|tile\./, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      path: 'tests/e2e/fixtures/tile.png',
    }),
  );
}
