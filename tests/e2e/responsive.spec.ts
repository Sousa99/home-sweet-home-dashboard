import { expect, test, type Page } from '@playwright/test';
import { installApiMocks } from './fixtures';

type LayoutKind = 'phone' | 'tablet' | 'desktop' | 'tv';

function layoutKind(width: number, height: number): LayoutKind {
  if (width < 640) return 'phone';
  if (width > height && height < 440) return 'phone';
  if (width < 1024) return 'tablet';
  if (width < 1920) return 'desktop';
  return 'tv';
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
}

async function blockBoxes(page: Page) {
  return page.locator('[data-block]').evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        id: element.getAttribute('data-block'),
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    }),
  );
}

async function smallTouchTargets(page: Page) {
  return page.locator('button, a, [role="button"]').evaluateAll((elements, minimum) => {
    return elements
      .filter((element) => {
        if (element.closest('.leaflet-control-attribution')) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none';
        return visible && (rect.width < minimum - 0.5 || rect.height < minimum - 0.5);
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          label: element.getAttribute('aria-label') ?? element.textContent?.trim().slice(0, 40),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      });
  }, 44);
}

test('responsive layout has no overflow and keeps every block in bounds', async ({
  page,
}, testInfo) => {
  const viewport = page.viewportSize();
  if (viewport === null) throw new Error('Playwright project has no viewport');
  const { width, height } = viewport;
  const kind = layoutKind(width, height);

  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await installApiMocks(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const shell = page.getByTestId('dashboard-shell');
  await expect(shell).toBeVisible();
  await expect(shell).toHaveAttribute('data-viewport', kind);
  await expect(shell).toHaveAttribute(
    'data-scroll',
    kind === 'phone' || kind === 'tablet' ? 'true' : 'false',
  );

  const blocks = page.locator('[data-block]');
  await expect(blocks).toHaveCount(6);

  const overflow = await horizontalOverflow(page);
  expect(overflow.document, 'document horizontal overflow').toBeLessThanOrEqual(1);
  expect(overflow.body, 'body horizontal overflow').toBeLessThanOrEqual(1);

  const boxes = await blockBoxes(page);
  expect(boxes.map((box) => box.id)).toEqual(
    expect.arrayContaining(['flights', 'weather', 'map', 'tasks', 'bus', 'status']),
  );
  for (const box of boxes) {
    expect(box.left, `${box.id} left edge`).toBeGreaterThanOrEqual(-1);
    expect(box.right, `${box.id} right edge`).toBeLessThanOrEqual(width + 1);
  }

  if (kind === 'phone' && height >= 800) {
    const firstScreen = ['bus', 'weather', 'tasks'];
    for (const id of firstScreen) {
      const box = boxes.find((candidate) => candidate.id === id);
      expect(box, `${id} block exists`).toBeDefined();
      expect(box?.bottom ?? Infinity, `${id} fits in the first screenful`).toBeLessThanOrEqual(
        height + 1,
      );
    }
  }

  if (kind === 'desktop' || kind === 'tv') {
    for (const box of boxes) {
      expect(box.top, `${box.id} top edge`).toBeGreaterThanOrEqual(-1);
      expect(box.bottom, `${box.id} bottom edge`).toBeLessThanOrEqual(height + 1);
    }
  }

  if (kind === 'phone' || kind === 'tablet') {
    expect(await smallTouchTargets(page), 'touch targets under 44px').toEqual([]);
  }

  expect(pageErrors, 'uncaught page errors').toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}-viewport.png`),
  });
  if (kind === 'phone' || kind === 'tablet') {
    await page.screenshot({
      path: testInfo.outputPath(`${testInfo.project.name}-full.png`),
      fullPage: true,
    });
  }
});

test('compact weather details expand on demand', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-390x844', 'phone-only interaction check');

  await installApiMocks(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const weather = page.locator('[data-block="weather"]');
  const collapsed = await weather.boundingBox();
  const details = page.getByRole('button', { name: 'Details' });
  await expect(details).toHaveAttribute('aria-expanded', 'false');

  await details.click();

  await expect(page.getByRole('button', { name: 'Less' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Hourly forecast')).toBeVisible();

  const expanded = await weather.boundingBox();
  expect(expanded?.height ?? 0).toBeGreaterThan(collapsed?.height ?? 0);

  const overflow = await horizontalOverflow(page);
  expect(overflow.document).toBeLessThanOrEqual(1);
  expect(overflow.body).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: testInfo.outputPath('phone-390x844-weather-expanded.png'),
    fullPage: true,
  });
});
