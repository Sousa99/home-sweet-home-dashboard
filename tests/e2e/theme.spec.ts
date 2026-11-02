import { expect, test, type Page } from '@playwright/test';
import { installApiMocks } from './fixtures';

const TARGET_PROJECTS = new Set(['phone-390x844', 'tablet-768x1024', 'tv-1920x1080']);

const LIGHT_BG = 'rgb(241, 238, 228)';
const LIGHT_SURFACE = 'rgb(255, 253, 246)';
const DARK_BG = 'rgb(16, 16, 16)';
const DARK_SURFACE = 'rgb(26, 26, 26)';

const LEGACY_COLORS = new Set([
  'rgb(255, 251, 235)',
  'rgb(217, 119, 6)',
  'rgb(15, 23, 42)',
  'rgb(100, 116, 139)',
]);

async function collectTiles(page: Page): Promise<string[]> {
  const urls: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (/openstreetmap|arcgisonline/.test(url)) urls.push(url);
  });
  return urls;
}

async function legacyColors(page: Page): Promise<string[]> {
  return page.evaluate((legacy) => {
    const wanted = new Set(legacy);
    const found: string[] = [];
    for (const element of Array.from(document.querySelectorAll('*'))) {
      const style = getComputedStyle(element);
      for (const color of [style.backgroundColor, style.color, style.borderTopColor]) {
        if (wanted.has(color)) found.push(`${element.tagName.toLowerCase()} ${color}`);
      }
    }
    return Array.from(new Set(found));
  }, Array.from(LEGACY_COLORS));
}

test('light appearance uses the neo-brutalist light tokens', async ({ page }, testInfo) => {
  test.skip(!TARGET_PROJECTS.has(testInfo.project.name), 'theme matrix runs on phone/tablet/TV');

  await page.emulateMedia({ colorScheme: 'light' });
  await installApiMocks(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(LIGHT_BG);

  const card = page.getByTestId('current-weather-card');
  await expect(card).toBeVisible();
  expect(await card.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    LIGHT_SURFACE,
  );
  expect(await card.evaluate((element) => getComputedStyle(element).borderTopLeftRadius)).toBe(
    '0px',
  );
  expect(await legacyColors(page)).toEqual([]);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-light.png`),
    fullPage:
      testInfo.project.name.startsWith('phone') || testInfo.project.name.startsWith('tablet'),
  });
});

test('dark appearance is deliberate and uses the dark basemap', async ({ page }, testInfo) => {
  test.skip(!TARGET_PROJECTS.has(testInfo.project.name), 'theme matrix runs on phone/tablet/TV');

  await page.emulateMedia({ colorScheme: 'dark' });
  const tiles = await collectTiles(page);
  await installApiMocks(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(DARK_BG);

  const card = page.getByTestId('current-weather-card');
  await expect(card).toBeVisible();
  expect(await card.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    DARK_SURFACE,
  );

  const lightPanels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('*'))
      .filter((element) => {
        const background = getComputedStyle(element).backgroundColor;
        return background === 'rgb(255, 255, 255)' || background === 'rgb(255, 253, 246)';
      })
      .map((element) => `${element.tagName.toLowerCase()}.${String(element.className)}`),
  );
  expect(lightPanels).toEqual([]);
  expect(await legacyColors(page)).toEqual([]);

  expect(tiles.some((url) => url.includes('arcgisonline'))).toBe(true);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-dark.png`),
    fullPage:
      testInfo.project.name.startsWith('phone') || testInfo.project.name.startsWith('tablet'),
  });
});

test('manual appearance persists and System follows the device again', async ({
  page,
}, testInfo) => {
  test.skip(!TARGET_PROJECTS.has(testInfo.project.name), 'theme matrix runs on phone/tablet/TV');

  await page.emulateMedia({ colorScheme: 'light' });
  await installApiMocks(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('hsh.dashboard.theme'))).toBe('dark');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: 'System', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('hsh.dashboard.theme'))).toBeNull();
});

test('the boot script applies the stored appearance before interaction', async ({
  page,
}, testInfo) => {
  test.skip(!TARGET_PROJECTS.has(testInfo.project.name), 'theme matrix runs on phone/tablet/TV');

  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { __initialTheme?: string }).__initialTheme =
        document.documentElement.dataset.theme;
    });
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await installApiMocks(page);
  await page.goto('/');

  expect(
    await page.evaluate(
      () => (window as unknown as { __initialTheme?: string }).__initialTheme ?? null,
    ),
  ).toBe('dark');
});

test('cards share one outline, radius, and shadow language in both appearances', async ({
  page,
}, testInfo) => {
  test.skip(!TARGET_PROJECTS.has(testInfo.project.name), 'theme matrix runs on phone/tablet/TV');

  await installApiMocks(page);

  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const summary = await page.evaluate(() => {
      const surfaces = Array.from(document.querySelectorAll<HTMLElement>('.bg-surface'));
      const radii = new Set<string>();
      const borderWidths = new Set<string>();
      const shadows = new Set<string>();
      const backgrounds = new Set<string>();
      for (const element of surfaces) {
        const style = getComputedStyle(element);
        radii.add(style.borderTopLeftRadius);
        borderWidths.add(style.borderTopWidth);
        shadows.add(style.boxShadow);
        backgrounds.add(style.backgroundImage);
      }
      return {
        count: surfaces.length,
        radii: [...radii],
        borderWidths: [...borderWidths],
        shadows: [...shadows],
        backgrounds: [...backgrounds],
      };
    });

    expect(summary.count).toBeGreaterThan(3);
    expect(summary.radii).toEqual(['0px']);
    expect(summary.backgrounds).toEqual(['none']);
    expect(summary.borderWidths.length).toBe(1);
    expect(summary.shadows.every((shadow) => shadow === 'none' || shadow.includes('px'))).toBe(
      true,
    );
  }
});
