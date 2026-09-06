import { test, expect } from '@playwright/test';

test('home page links to every demo', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Try svgin-react' })).toBeVisible();

    for (const path of ['/inspector', '/rsc', '/suspense', '/provider', '/lazy', '/native-props', '/shadow']) {
        await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
    }
});

test('top nav Try it and Docs links work from any page', async ({ page }) => {
    // The top nav collapses every demo into a single "Try it" link back to
    // the home page's card grid, rather than one link per demo - reachable
    // from a page that is neither, to prove it is not just a same-page no-op.
    await page.goto('/inspector');
    await page.getByRole('link', { name: 'Docs', exact: true }).click();
    await expect(page).toHaveURL('/docs');
    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

    await page.getByRole('link', { name: 'Try it', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Try svgin-react' })).toBeVisible();
});

test('docs sidebar reaches installation and API reference, and links back out to a live demo', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

    const sidebar = page.getByLabel('Site navigation');
    await sidebar.getByRole('link', { name: 'Installation', exact: true }).click();
    await expect(page).toHaveURL('/docs/installation');
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'API reference', exact: true }).click();
    await expect(page).toHaveURL('/docs/api');
    await expect(page.getByRole('heading', { name: 'API reference' })).toBeVisible();

    // The API reference page links to a live demo inline, not just via the
    // sidebar's own "Try it" section.
    await page.getByRole('main').getByRole('link', { name: 'live demo' }).first().click();
    await expect(page).toHaveURL('/suspense');
});

test('the same sidebar (Docs and Try it) appears on demo pages too, not just docs pages', async ({ page }) => {
    // Regression coverage for a real inconsistency: this sidebar used to be
    // docs-only, so a visitor on a demo page had no equivalent way to jump
    // to another demo or into the docs without going through the header.
    await page.goto('/suspense');

    const sidebar = page.getByLabel('Site navigation');
    await expect(sidebar.getByRole('link', { name: 'Installation', exact: true })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Shadow DOM', exact: true })).toBeVisible();

    await sidebar.getByRole('link', { name: 'Shadow DOM', exact: true }).click();
    await expect(page).toHaveURL('/shadow');
});
