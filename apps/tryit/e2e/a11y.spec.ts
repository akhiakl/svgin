import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Scans every route with axe-core's WCAG 2.0/2.1 A/AA rule sets. Fails on
// any violation - not just "serious"/"critical" - so a real accessibility
// regression can't slip in as "not that bad". If a rule genuinely doesn't
// apply to a given page, exclude it explicitly with a comment explaining
// why, rather than lowering the bar for every route.
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
    '/element',
];

// Every violation found, regardless of route/test, gets attached to that
// test's own result as structured JSON (visible in the JSON reporter's
// output) - not just asserted against in the failure message. This is what
// lets CI's pr-report job (see #22) build a real violation-count-by-impact
// summary instead of just a pass/fail bit, without parsing a failure
// message string.
async function expectNoViolations(page: import('@playwright/test').Page, testInfo: import('@playwright/test').TestInfo) {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('axe-violations', {
        body: JSON.stringify(results.violations),
        contentType: 'application/json',
    });
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

for (const route of ROUTES) {
    test(`${route} has no automatically detectable accessibility violations`, async ({ page }, testInfo) => {
        await page.goto(route, { waitUntil: 'load' });
        // Let client-only demos (Suspense/Provider/Lazy) finish their
        // initial render before scanning, so axe sees the settled DOM
        // rather than a loading fallback.
        await page.waitForTimeout(500);
        await expectNoViolations(page, testInfo);
    });
}

test('mobile nav sheet has no accessibility violations while open', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.getByLabel('Open navigation menu').click();
    await page.getByRole('dialog').waitFor();
    await expectNoViolations(page, testInfo);
});
