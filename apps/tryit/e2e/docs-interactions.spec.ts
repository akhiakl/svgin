import { test, expect } from '@playwright/test';

test('code block copy button copies the shown code to the clipboard', async ({ page, context, browserName }) => {
    // clipboard-read/clipboard-write are a Chromium-specific permission
    // model - Firefox and WebKit reject grantPermissions for them outright.
    // Their automated contexts still allow the copy button's own
    // navigator.clipboard.writeText() call to succeed without an explicit
    // grant, so the "Copied" state below (which CodeBlock only shows once
    // that write has resolved without throwing) is real cross-browser
    // proof the copy happened - reading the clipboard back to check its
    // exact contents is the extra assertion only Chromium can make.
    if (browserName === 'chromium') {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await page.goto('/docs/installation');

    await page.getByRole('button', { name: 'Copy code' }).first().click();
    await expect(page.getByRole('button', { name: 'Copied' }).first()).toBeVisible();

    if (browserName === 'chromium') {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBe('pnpm add svgin-react');
    }
});

test('the installation page switches package manager commands via tabs', async ({ page }) => {
    await page.goto('/docs/installation');

    // CodeBlock (Bright) renders one <pre> per color scheme and toggles
    // which is shown with CSS, so each command's text exists twice in the
    // DOM - `.and(page.locator(':visible'))` narrows back down to the one
    // actually on screen instead of tripping Playwright's strict mode.
    const visibleCommand = (text: string) => page.getByText(text).and(page.locator(':visible'));

    const tabs = page.getByRole('tablist', { name: 'Package manager' }).first();
    await expect(visibleCommand('pnpm add svgin-react')).toBeVisible();

    await tabs.getByRole('tab', { name: 'npm', exact: true }).click();
    await expect(visibleCommand('npm install svgin-react')).toBeVisible();

    await tabs.getByRole('tab', { name: 'yarn', exact: true }).click();
    await expect(visibleCommand('yarn add svgin-react')).toBeVisible();

    await tabs.getByRole('tab', { name: 'bun', exact: true }).click();
    await expect(visibleCommand('bun add svgin-react')).toBeVisible();
});
