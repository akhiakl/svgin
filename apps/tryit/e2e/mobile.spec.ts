import { test, expect } from '@playwright/test';

// Checks every route for horizontal overflow. A plain viewport, since device emulation needs sandbox flags.
test.use({ viewport: { width: 390, height: 844 } });

const ROUTES = [
    '/',
    '/react',
    '/element',
    '/docs',
    '/docs/react/installation',
    '/docs/react/api',
    '/docs/element/installation',
    '/docs/element/api',
    '/inspector',
    '/rsc',
    '/suspense',
    '/provider',
    '/lazy',
    '/native-props',
    '/shadow',
    '/element/basic',
    '/element/raw',
    '/element/lazy',
    '/element/inspector',
    '/element/events',
];

for (const route of ROUTES) {
    test(`${route} has no horizontal overflow on a mobile viewport`, async ({ page }) => {
        // 'load', not 'networkidle': /provider and /suspense deliberately
        // keep fetching a broken URL client-side, which would never let
        // networkidle settle.
        await page.goto(route, { waitUntil: 'load' });
        await page.waitForTimeout(500);
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBe(0);
    });
}

test('inspector sanitized markup does not overflow the viewport once expanded', async ({ page }) => {
    // An open <details> with a white-space: pre <pre> must not widen the grid; the route check runs before it opens.
    await page.goto('/inspector', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Sanitize' }).click();
    await page.getByText('Sanitized markup').click();
    await expect(page.locator('pre').filter({ hasText: '<svg' })).toBeVisible();

    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBe(0);
});

test('mobile nav sheet reuses the same SiteSidebar (groups open by default) and navigates on link click', async ({ page }) => {
    await page.goto('/');
    // The horizontal link list is desktop-only (hidden below sm); the
    // trigger button is the only way to reach navigation on this viewport.
    await expect(page.getByRole('list')).toBeHidden();
    await page.getByLabel('Open navigation menu').click();

    const sheet = page.getByRole('dialog');
    await expect(sheet.getByRole('link', { name: 'svgin / try it' })).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'Introduction' })).toBeVisible();

    // Groups start open, so every link is reachable without a tap.
    for (const path of ['/inspector', '/rsc', '/suspense', '/provider', '/lazy', '/native-props', '/shadow']) {
        await expect(sheet.locator(`a[href="${path}"]`)).toBeVisible();
    }
    for (const path of ['/element/basic', '/element/raw', '/element/lazy', '/element/inspector', '/element/events']) {
        await expect(sheet.locator(`a[href="${path}"]`)).toBeVisible();
    }

    await sheet.locator('a[href="/inspector"]').click();
    await expect(page).toHaveURL('/inspector');
    // Clicking a link closes the sheet, not just navigates.
    await expect(page.getByRole('dialog')).toBeHidden();
});

test('the inline SiteSidebar is hidden below lg, since the mobile drawer already has it', async ({ page }) => {
    await page.goto('/suspense');
    // The mobile drawer's own copy isn't rendered until opened, so this
    // targets the always-in-the-DOM inline one via its aria-label.
    await expect(page.getByLabel('Site navigation')).toBeHidden();
});
