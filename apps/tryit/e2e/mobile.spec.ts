import { test, expect } from '@playwright/test';

// Regression coverage for a real bug: the Inspector page's example buttons
// used to sit in a single non-wrapping flex row alongside the card title,
// pushing the page wider than the viewport on narrow screens (the
// "Malicious" button got clipped off the right edge). Checked generically
// across every route so a similar overflow elsewhere doesn't go unnoticed.
// A plain narrow viewport rather than a full device descriptor (isMobile,
// touch emulation) - the latter needs browser sandbox flags this repo's own
// dev environment doesn't always have, and viewport width is all this check
// needs.
test.use({ viewport: { width: 390, height: 844 } });

const ROUTES = [
    '/',
    '/docs',
    '/docs/installation',
    '/docs/api',
    '/inspector',
    '/rsc',
    '/suspense',
    '/provider',
    '/lazy',
    '/native-props',
    '/shadow',
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
    // Regression coverage for a real bug: the grid wrapping the two
    // Inspector cards had no explicit grid-cols-1 at the base breakpoint, so
    // the browser fell back to implicit "auto" track sizing, which respects
    // a child's min-content width. The sanitized-markup <pre> is
    // white-space: pre (unbreakable), so once its <details> was expanded it
    // blew the track - and the whole page - wider than the viewport, which
    // is what makes a mobile browser render the page zoomed out to fit.
    // The ROUTES check above can't catch this: it measures overflow before
    // that <details> is opened, when the <pre> contributes no width at all.
    await page.goto('/inspector', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Sanitize' }).click();
    await page.getByText('Sanitized markup').click();
    await expect(page.locator('pre').filter({ hasText: '<svg' })).toBeVisible();

    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBe(0);
});

test('mobile nav sheet opens, lists every route, and navigates on link click', async ({ page }) => {
    await page.goto('/');
    // The horizontal link list is desktop-only (hidden below sm); the
    // trigger button is the only way to reach navigation on this viewport.
    await expect(page.getByRole('list')).toBeHidden();
    await page.getByLabel('Open navigation menu').click();

    const sheet = page.getByRole('dialog');
    for (const label of [
        // Level 1
        'Try it',
        'Docs',
        // Level 2, nested under "Try it"
        'Inspector',
        'Server component',
        'Suspense',
        'Provider defaults',
        'Lazy loading',
        'Native SVG props',
        'Shadow DOM',
        // Level 2, nested under "Docs"
        'Introduction',
        'Installation',
        'API reference',
    ]) {
        await expect(sheet.getByRole('link', { name: label, exact: true })).toBeVisible();
    }

    await sheet.getByRole('link', { name: 'Inspector', exact: true }).click();
    await expect(page).toHaveURL('/inspector');
    // Clicking a link closes the sheet (SheetClose), not just navigates.
    await expect(page.getByRole('dialog')).toBeHidden();
});
