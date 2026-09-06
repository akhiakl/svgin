import { test, expect } from '@playwright/test';

test('RSC demo renders the server-fetched icon', async ({ page }) => {
    await page.goto('/rsc');
    await expect(page.locator('main svg').first()).toBeVisible();
});

test('Suspense demo suspends then renders, and recovers from a broken URL', async ({ page }) => {
    await page.goto('/suspense');
    await page.getByRole('button', { name: 'Load valid SVG' }).click();
    await expect(page.locator('main svg').first()).toBeVisible();

    await page.getByRole('button', { name: 'Load broken URL' }).click();
    await expect(page.getByText(/Caught by error boundary/)).toBeVisible();

    await page.getByRole('button', { name: 'Reset' }).click();
    await page.getByRole('button', { name: 'Load valid SVG' }).click();
    await expect(page.locator('main svg').first()).toBeVisible();
});

test('Suspense demo error boundary also catches neither src nor svg being given', async ({ page }) => {
    await page.goto('/suspense');
    await page.getByRole('button', { name: 'Render with neither src nor svg' }).click();
    await expect(page.getByText(/Caught by error boundary/)).toBeVisible();
});

test('Provider demo shows the custom fallback only inside SvgInProvider', async ({ page }) => {
    await page.goto('/provider');
    await expect(page.getByText('Custom provider fallback')).toBeVisible();
});

test('Lazy loading demo eventually renders the icon after scrolling to it', async ({ page }) => {
    await page.goto('/lazy');
    await page.getByText(/Scroll down/).scrollIntoViewIfNeeded();
    await page.locator('main svg').first().scrollIntoViewIfNeeded();
    await expect(page.locator('main svg').first()).toBeVisible();
});

test('Native props demo counts clicks on the rendered svg and cycles its style.color', async ({ page }) => {
    await page.goto('/native-props');
    const icon = page.locator('main svg').first();
    await expect(icon).toBeVisible();

    await icon.click();
    await expect(page.getByText('Clicked 1 time')).toBeVisible();
    await icon.click();
    await expect(page.getByText('Clicked 2 times')).toBeVisible();

    const before = await icon.evaluate((el) => (el as SVGElement).style.color);
    await page.getByRole('button', { name: 'Cycle style.color' }).click();
    await expect
        .poll(() => icon.evaluate((el) => (el as SVGElement).style.color))
        .not.toBe(before);
});

test('Native props demo forwards data-* attributes onto the rendered svg', async ({ page }) => {
    await page.goto('/native-props');
    await expect(page.locator('svg[data-testid="native-props-demo-icon"]')).toHaveAttribute('data-demo', 'svgin-react');
});

test('Shadow demo keeps SvgInShadow immune to a page rule that recolors the plain SvgIn beside it', async ({ page }) => {
    await page.goto('/shadow');
    const lightPath = page.locator('main svg path').first();
    await expect(lightPath).toHaveCSS('stroke', 'rgb(236, 72, 153)'); // #ec4899, the leaking page rule

    // The shadow-rendered <svg>/<path> live inside a shadow root, unreachable
    // via ordinary CSS selectors from the page - reading their computed
    // style has to reach through the host element's shadowRoot. Wait for it
    // to actually appear first, so a broken/missing shadow root fails this
    // test loudly instead of silently comparing against null.
    await page.waitForFunction(() => {
        const host = document.querySelector('[data-testid="shadow-demo-host"]');
        return Boolean(host?.shadowRoot?.querySelector('path'));
    });
    const shadowStroke = await page.evaluate(() => {
        const host = document.querySelector('[data-testid="shadow-demo-host"]');
        const path = host!.shadowRoot!.querySelector('path')!;
        return getComputedStyle(path).stroke;
    });
    expect(shadowStroke).not.toBe('rgb(236, 72, 153)');
});
