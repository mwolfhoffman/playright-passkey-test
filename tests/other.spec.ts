import { test, expect } from '@playwright/test';

test('example to make sure run in all browsers', async ({ page }) => {
    await page.goto('https://example.com');
    const title = page.locator('h1');
    await expect(title).toHaveText('Example Domain');
});