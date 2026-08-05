import { expect, test } from '@playwright/test';

type LocationResponse = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  admin1?: string;
  timezone?: string;
};

const locations: Record<string, LocationResponse> = {
  london: {
    id: 1,
    name: 'London',
    latitude: 51.5072,
    longitude: -0.1276,
    country_code: 'GB',
    timezone: 'Europe/London',
  },
  paris: {
    id: 2,
    name: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    country_code: 'FR',
    admin1: 'Ile-de-France',
    timezone: 'Europe/Paris',
  },
  berlin: {
    id: 3,
    name: 'Berlin',
    latitude: 52.52,
    longitude: 13.405,
    country_code: 'DE',
    admin1: 'Berlin',
    timezone: 'Europe/Berlin',
  },
  hongkong: {
    id: 4,
    name: 'Hong Kong',
    latitude: 22.3193,
    longitude: 114.1694,
    country_code: 'HK',
    timezone: 'Asia/Hong_Kong',
  },
};

const buildTimes = (start: Date, count: number, stepHours: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getTime() + index * stepHours * 60 * 60 * 1000);
    return date.toISOString();
  });

const buildDailyDates = (start: Date, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  });

const normalizeSearchKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const buildForecastResponse = (lat: number, lon: number) => {
  const isHongKong = Math.abs(lat - 22.3193) < 0.05 && Math.abs(lon - 114.1694) < 0.05;
  const start = new Date(isHongKong ? '2026-05-22T00:00:00Z' : '2026-05-22T06:00:00Z');
  const hourlyCount = 48;
  const dailyCount = 7;

  const hourlyTimes = buildTimes(start, hourlyCount, 1);
  const dailyDates = buildDailyDates(start, dailyCount);
  const currentIndex = isHongKong ? 12 : 0;

  return {
    latitude: lat,
    longitude: lon,
    timezone: 'UTC',
    current: {
      time: hourlyTimes[currentIndex],
      temperature_2m: 18,
      relative_humidity_2m: 60,
      apparent_temperature: 17,
      weather_code: 1,
      wind_speed_10m: 4,
      wind_direction_10m: 180,
      uv_index: 3,
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTimes.map((_, index) => 16 + (index % 6)),
      relative_humidity_2m: hourlyTimes.map(() => 60),
      apparent_temperature: hourlyTimes.map((_, index) => 15 + (index % 6)),
      weather_code: hourlyTimes.map(() => 1),
      wind_speed_10m: hourlyTimes.map(() => 4),
      precipitation_probability: hourlyTimes.map(() => 10),
    },
    daily: {
      time: dailyDates,
      weather_code: dailyDates.map(() => 2),
      temperature_2m_max: dailyDates.map(() => 21),
      temperature_2m_min: dailyDates.map(() => 12),
      precipitation_sum: dailyDates.map(() => 1),
      wind_speed_10m_max: dailyDates.map(() => 6),
      sunrise: dailyDates.map((date) => `${date}T05:45:00Z`),
      sunset: dailyDates.map((date) => `${date}T20:35:00Z`),
    },
  };
};

test.beforeEach(async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url());
    const name = url.searchParams.get('name')?.toLowerCase() ?? '';

    const matched = Object.keys(locations).find((key) => {
      const normalizedKey = normalizeSearchKey(key);
      const normalizedName = normalizeSearchKey(name);

      return normalizedKey.startsWith(normalizedName) || normalizedName.startsWith(normalizedKey);
    });
    const result = matched ? [locations[matched]] : [];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: result }),
    });
  });

  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());
    const lat = Number(url.searchParams.get('latitude') ?? 0);
    const lon = Number(url.searchParams.get('longitude') ?? 0);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildForecastResponse(lat, lon)),
    });
  });
});

test('loads the default weather and renders main sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Hourly Temperature')).toBeVisible();
  await expect(page.getByText('Hourly and Weekly Outlook')).toBeVisible();
  await expect(page.getByPlaceholder('Search city')).toHaveValue('London, GB');
  await expect(page.getByText('6:45 AM')).toBeVisible();
});

test('autocomplete selects a suggestion with keyboard navigation', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Search city');
  await expect(input).toHaveValue('London, GB');
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.type('par');

  await expect(page.getByRole('option', { name: 'Paris, Ile-de-France, FR' })).toBeVisible();
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(input).toHaveValue('Paris, Ile-de-France, FR');
  await expect(page.getByText('Hourly Temperature')).toBeVisible();
});

test('autocomplete uses cached results for repeated queries', async ({ page }) => {
  const callCount: Record<string, number> = {};

  await page.unroute('**/geocoding-api.open-meteo.com/v1/search**');
  await page.unroute('**/api.open-meteo.com/v1/forecast**');

  await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url());
    const name = url.searchParams.get('name')?.toLowerCase() ?? '';
    const key = name.trim();
    callCount[key] = (callCount[key] ?? 0) + 1;

    const matched = Object.keys(locations).find((loc) => {
      const normalizedKey = normalizeSearchKey(loc);
      const normalizedName = normalizeSearchKey(name);

      return normalizedKey.startsWith(normalizedName) || normalizedName.startsWith(normalizedKey);
    });
    const result = matched ? [locations[matched]] : [];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: result }),
    });
  });

  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());
    const lat = Number(url.searchParams.get('latitude') ?? 0);
    const lon = Number(url.searchParams.get('longitude') ?? 0);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildForecastResponse(lat, lon)),
    });
  });

  await page.goto('/');

  const input = page.getByPlaceholder('Search city');
  await expect(input).toHaveValue('London, GB');
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.type('ber');
  await expect(page.getByRole('option', { name: 'Berlin, Berlin, DE' })).toBeVisible();

  await input.press('Control+A');
  await input.press('Backspace');
  await input.type('ber');
  await expect(page.getByRole('option', { name: 'Berlin, Berlin, DE' })).toBeVisible();

  await expect.poll(() => callCount.ber).toBe(1);
});

test('hourly outlook starts from the current hour for timezone-aware locations', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Search city');
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.type('hong kong');

  await expect(page.getByRole('option', { name: 'Hong Kong, HK' })).toBeVisible();
  await input.press('ArrowDown');
  await input.press('Enter');

  await expect(page.getByText('9 PM', { exact: true })).toBeVisible();
});

test('visual snapshot of the dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Hourly Temperature')).toBeVisible();

  await page.addStyleTag({
    content: '* { animation-duration: 0s !important; transition-duration: 0s !important; }',
  });

  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.01,
  });
});

test('renders a decorative animated background canvas', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('canvas[aria-hidden="true"]');
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();
});

test('auto-refresh settings offer only cache-aligned intervals', async ({ page }) => {
  await page.goto('/');

  await page.getByTitle('Settings').click();
  await expect(page.getByText('Auto Refresh')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Off' })).toBeVisible();
  await expect(page.getByRole('button', { name: '30m' })).toBeVisible();
  await expect(page.getByRole('button', { name: '60m' })).toBeVisible();
  await expect(page.getByRole('button', { name: '5m' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '10m' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '15m' })).toHaveCount(0);
});
