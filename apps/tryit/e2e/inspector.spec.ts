import { test, expect } from '@playwright/test';

test('clean example renders with nothing removed', async ({ page }) => {
    await page.goto('/inspector');
    await expect(page.getByText('Nothing removed')).toBeVisible();
    await expect(page.locator('main svg').first()).toBeVisible();
});

test('malicious example is sanitized and the removed tags/attrs are listed', async ({ page }) => {
    await page.goto('/inspector');
    await page.getByRole('button', { name: 'Malicious' }).click();

    await expect(page.getByText('<script>', { exact: true })).toBeVisible();
    await expect(page.getByText('onclick', { exact: true })).toBeVisible();
    await expect(page.getByText('onload', { exact: true })).toBeVisible();

    // The actually-rendered <svg> must not contain the stripped bits, not
    // just the summary badges above it.
    const svgHtml = await page.locator('main svg').first().evaluate((el) => el.outerHTML);
    expect(svgHtml).not.toContain('onclick');
    expect(svgHtml).not.toContain('<script');
});

test('editing the textarea and clicking Sanitize re-runs sanitization', async ({ page }) => {
    await page.goto('/inspector');
    const textarea = page.getByLabel('Raw SVG input');
    // xmlns matters here beyond realism: DOMPurify's SVG-profile sanitizer
    // parses this as XML, and a root <svg> with no namespace declaration is
    // exactly the kind of malformed input that gets namespace-resolution
    // (and therefore attribute-stripping) treated inconsistently across
    // browser XML parsers - WebKit's in particular. Every other fixture in
    // this file already declares it; this one should too.
    await textarea.fill(
        '<svg xmlns="http://www.w3.org/2000/svg"><rect onclick="evil()" width="1" height="1" /></svg>'
    );
    await page.getByRole('button', { name: 'Sanitize' }).click();
    await expect(page.getByText('onclick', { exact: true })).toBeVisible();
});
