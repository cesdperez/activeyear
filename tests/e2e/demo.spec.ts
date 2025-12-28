import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('loads demo data when clicking the link', async ({ page }) => {
        // Find and click the demo link
        const demoLink = page.getByRole('button', { name: /demo data/i });
        await expect(demoLink).toBeVisible();
        await demoLink.click();

        // Verify dashboard loads
        // Main grid stats (4 cards)
        await expect(page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 .stat-card')).toHaveCount(4);

        // Sports breakdown - verify sport bars are present (yoga may be consolidated into "other")
        const sportBars = page.locator('.space-y-6 .group');
        const count = await sportBars.count();
        expect(count).toBeGreaterThanOrEqual(4);

        // Verify specific demo data values
        const labels = page.locator('.stat-label');
        // Total stats (4) + PR labels (3) = 7 (Consistency stats don't use .stat-label class)
        await expect(labels).toHaveCount(7);

        // Check if one of them contains 'Total Distance' and make sure it is visible
        await expect(labels.filter({ hasText: 'Total Distance' })).toBeVisible();

        // Verify data in header (proves store is loaded and dashboard rendered)
        await expect(page.getByText('245').first()).toBeVisible(); // Activity Count
        await expect(page.getByText('180').first()).toBeVisible(); // Active Days
    });
});
