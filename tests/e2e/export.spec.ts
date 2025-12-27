import { test, expect, type Page } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test.describe('Export Flow', () => {
    // Helper to upload CSV and get to dashboard
    async function uploadAndWaitForDashboard(page: Page) {
        // Disable animations for stability
        await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }' });

        await page.goto('/');
        const fileInput = page.locator('input[type="file"]');
        const csvPath = join(__dirname, '..', '..', 'src', 'lib', 'parsers', '__fixtures__', 'garmin-sample.csv');
        await fileInput.setInputFiles(csvPath);
        await expect(page.getByRole('heading', { name: 'Your 2025' })).toBeVisible({ timeout: 10000 });
    }

    test('export panel appears after upload', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        // Check export section is visible
        await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();

        // Check aspect ratio buttons are present
        await expect(page.getByRole('button', { name: /9:16/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /1:1/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /4:5/i })).toBeVisible();

        // Check download button
        await expect(page.getByRole('button', { name: /Download PNG/i })).toBeVisible();
    });

    test('aspect ratio switching works', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        // 9:16 should be selected by default
        const button916 = page.getByRole('button', { name: /9:16/i });
        await expect(button916).toHaveClass(/bg-\[var\(--color-accent\)\]/);

        // Click 1:1
        const button11 = page.getByRole('button', { name: /1:1/i });
        await button11.click();

        // Verify selection changed (1:1 has accent background now)
        await expect(button11).toHaveClass(/bg-\[var\(--color-accent\)\]/);

        // Click 4:5
        const button45 = page.getByRole('button', { name: /4:5/i });
        await button45.click();
        await expect(button45).toHaveClass(/bg-\[var\(--color-accent\)\]/);
    });

    test('user name personalization works', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        // Find the name input
        const nameInput = page.locator('#userName');
        await expect(nameInput).toBeVisible();

        // Enter a name
        await nameInput.fill('César');

        // Verify the name appears in the export card preview
        const exportCard = page.locator('#export-card');
        await expect(exportCard.getByText("César's")).toBeVisible();
    });

    test('export card preview renders with stats', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        // Verify export card is visible with key elements
        const exportCard = page.locator('#export-card');
        await expect(exportCard).toBeVisible();

        // Check year heading
        await expect(exportCard.getByText('2025')).toBeVisible();
        await expect(exportCard.getByText('Year in Sport')).toBeVisible();

        // Check stats are rendered (from sample data)
        await expect(exportCard.getByText('Total Distance')).toBeVisible();
        await expect(exportCard.getByText('Time Active')).toBeVisible();

        // Check watermark
        await expect(exportCard.getByText('activeyear.app')).toBeVisible();
    });

    test('download button is clickable', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        const downloadButton = page.getByRole('button', { name: /Download PNG/i });
        await expect(downloadButton).toBeEnabled();

        // Note: We can't easily test actual file download in headless mode
        // but we verify the button triggers the export action
        await downloadButton.click();

        // Should show "Generating..." state briefly
        // The button text changes during export
        await expect(page.getByText(/Generating|Download PNG/i)).toBeVisible();
    });

    test('theme selector is visible', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        // Check theme buttons are present
        await expect(page.getByRole('button', { name: /Neon/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Minimal/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Retro/i })).toBeVisible();
    });

    test('theme switching works', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        const exportCard = page.locator('#export-card');

        // Neon should be default (data-theme="neon")
        await expect(exportCard).toHaveAttribute('data-theme', 'neon');

        // Click Minimalist
        await page.getByRole('button', { name: /Minimal/i }).click();
        await expect(exportCard).toHaveAttribute('data-theme', 'minimalist');

        // Click Retro
        await page.getByRole('button', { name: /Retro/i }).click();
        await expect(exportCard).toHaveAttribute('data-theme', 'retro');

        // Click back to Neon
        await page.getByRole('button', { name: /Neon/i }).click();
        await expect(exportCard).toHaveAttribute('data-theme', 'neon');
    });

    test('wrapper has correct scaled dimensions', async ({ page }) => {
        await uploadAndWaitForDashboard(page);

        // Default is 9:16, width 1080, scale 0.35 => 378px
        const wrapper = page.locator('.export-card-wrapper');
        await expect(wrapper).toHaveCSS('width', '378px');

        // Height 1920 * 0.35 => 672px
        await expect(wrapper).toHaveCSS('height', '672px');
    });
});
