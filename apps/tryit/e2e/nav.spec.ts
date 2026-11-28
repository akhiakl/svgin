import { test, expect } from '@playwright/test';

test('home page links to the React and Element landing pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Try svgin' })).toBeVisible();

    for (const path of ['/react', '/element']) {
        await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
    }
});

test('the React landing page links to every React demo', async ({ page }) => {
    await page.goto('/react');
    await expect(page.getByRole('heading', { name: '@svgin/react', exact: true })).toBeVisible();

    for (const path of ['/inspector', '/rsc', '/suspense', '/provider', '/lazy', '/native-props', '/shadow']) {
        await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
    }
});

test('the Element landing page links to every Element demo', async ({ page }) => {
    await page.goto('/element');
    await expect(page.getByRole('heading', { name: '@svgin/element', exact: true })).toBeVisible();

    for (const path of ['/element/basic', '/element/raw', '/element/lazy', '/element/inspector', '/element/events']) {
        await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
    }
});

test('top nav Try it and Docs links work from any page', async ({ page }) => {
    // "Try it" links back to the package picker; start elsewhere to prove it navigates.
    await page.goto('/inspector');
    await page.getByRole('link', { name: 'Docs', exact: true }).click();
    await expect(page).toHaveURL('/docs');
    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

    await page.getByRole('link', { name: 'Try it', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Try svgin' })).toBeVisible();
});

test('docs sidebar reaches React installation and API reference, and links back out to a live demo', async ({ page }) => {
    await page.goto('/docs');
    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

    // React's group renders first, so .first() disambiguates from Element's
    // own identically-labeled Installation/API reference links.
    const sidebar = page.getByLabel('Site navigation');
    await sidebar.getByRole('link', { name: 'Installation', exact: true }).first().click();
    await expect(page).toHaveURL('/docs/react/installation');
    await expect(page.getByRole('heading', { name: '@svgin/react: Installation' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'API reference', exact: true }).first().click();
    await expect(page).toHaveURL('/docs/react/api');
    await expect(page.getByRole('heading', { name: '@svgin/react: API reference' })).toBeVisible();

    // The API reference page links to a live demo inline, not just via the
    // sidebar's own "Try it" section.
    await page.getByRole('main').getByRole('link', { name: 'live demo' }).first().click();
    await expect(page).toHaveURL('/suspense');
});

test('docs sidebar also reaches Element installation and API reference', async ({ page }) => {
    await page.goto('/docs');

    const sidebar = page.getByLabel('Site navigation');
    await sidebar.getByRole('link', { name: 'Installation', exact: true }).last().click();
    await expect(page).toHaveURL('/docs/element/installation');
    await expect(page.getByRole('heading', { name: '@svgin/element: Installation' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'API reference', exact: true }).last().click();
    await expect(page).toHaveURL('/docs/element/api');
    await expect(page.getByRole('heading', { name: '@svgin/element: API reference' })).toBeVisible();
});

test('the same sidebar (Docs and Try it) appears on demo pages too, not just docs pages', async ({ page }) => {
    await page.goto('/suspense');

    const sidebar = page.getByLabel('Site navigation');
    await expect(sidebar.getByRole('link', { name: 'Installation', exact: true }).first()).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Shadow DOM', exact: true })).toBeVisible();

    await sidebar.getByRole('link', { name: 'Shadow DOM', exact: true }).click();
    await expect(page).toHaveURL('/shadow');
});
