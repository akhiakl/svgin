import { test, expect } from '@playwright/test';

// getComputedStyle reports --background as lab(), so compare lightness instead of the oklch() source.
async function backgroundLightness(page: import('@playwright/test').Page): Promise<number> {
    const raw = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    const match = raw.match(/^lab\((\d+(?:\.\d+)?)%/);
    if (!match) throw new Error(`Unexpected --background computed value: ${raw}`);
    return Number(match[1]);
}

test('follows a dark system color scheme by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    expect(await backgroundLightness(page)).toBeLessThan(20);
});

test('still renders the light background with a light system color scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await backgroundLightness(page)).toBeGreaterThan(90);
});

test('the theme toggle overrides the system preference and persists it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await backgroundLightness(page)).toBeGreaterThan(90);

    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    expect(await backgroundLightness(page)).toBeLessThan(20);

    // A stored manual choice should win over the system scheme on the next
    // visit, not just on this page instance.
    await page.reload();
    expect(await backgroundLightness(page)).toBeLessThan(20);
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
});
