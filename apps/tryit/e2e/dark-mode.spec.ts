import { test, expect } from '@playwright/test';

// Regression coverage for a real bug: dark mode tokens in globals.css used
// to be defined only under a `.dark` class selector that nothing in the app
// ever applied, so a visitor with a dark system theme still got the light
// page. next-themes now applies that class - by default it follows the
// system preference, and the toggle in SiteNav lets a visitor override it
// (persisted in localStorage).
//
// getComputedStyle normalizes the --background custom property to a
// lab(L% a b) string regardless of how it was declared (oklch() here) -
// this reads the lightness percentage out of that rather than trying to
// match the source oklch() text, which the browser doesn't preserve.
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
