import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Fails on any WCAG 2.0/2.1 A/AA violation. Exclude a rule per page with a reason rather than lowering the bar.
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

// Attached as JSON so pr-report can count violations by impact.
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
