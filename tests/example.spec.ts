import { test, expect } from '@playwright/test';

test('should looks same', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('page.png');

    await page.locator('#tab_kitchen').click();
    await expect(page).toHaveScreenshot('kitchen.png');

    await page.locator('#tab_all').click();
    await expect(page).toHaveScreenshot('all.png');
});
