import { test, expect } from '@playwright/test';

test('code block copy button copies the shown code to the clipboard', async ({ page, context, browserName }) => {
    // Only Chromium supports clipboard permissions; elsewhere the "Copied" state is the proof.
    if (browserName === 'chromium') {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await page.goto('/docs/react/installation');

    await page.getByRole('button', { name: 'Copy code' }).first().click();
    await expect(page.getByRole('button', { name: 'Copied' }).first()).toBeVisible();

    if (browserName === 'chromium') {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBe('pnpm add @svgin/react');
    }
});

test('the installation page switches package manager commands via tabs', async ({ page }) => {
    await page.goto('/docs/react/installation');

    // Bright renders one <pre> per theme, so pick the visible one.
    const visibleCommand = (text: string) => page.getByText(text).and(page.locator(':visible'));

    const tabs = page.getByRole('tablist', { name: 'Package manager' }).first();
    await expect(visibleCommand('pnpm add @svgin/react')).toBeVisible();

    await tabs.getByRole('tab', { name: 'npm', exact: true }).click();
    await expect(visibleCommand('npm install @svgin/react')).toBeVisible();

    await tabs.getByRole('tab', { name: 'yarn', exact: true }).click();
    await expect(visibleCommand('yarn add @svgin/react')).toBeVisible();

    await tabs.getByRole('tab', { name: 'bun', exact: true }).click();
    await expect(visibleCommand('bun add @svgin/react')).toBeVisible();
});
