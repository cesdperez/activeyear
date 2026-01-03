import { test, expect } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test.describe('Upload Flow', () => {
    test('home page displays upload UI', async ({ page }) => {
        // Disable animations for stability
        await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }' });

        await page.goto('/');

        // Check main heading
        await expect(page.getByRole('heading', { name: 'ActiveYear' })).toBeVisible();

        // Check upload zone
        await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
        await expect(page.getByText('Your data never leaves this browser')).toBeVisible();
    });

    test('shows instructions for getting data', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByText('How to get your data')).toBeVisible();
        await expect(page.getByText('connect.garmin.com')).toBeVisible();
    });

    test('processes uploaded CSV and shows dashboard', async ({ page }) => {
        await page.goto('/');

        // Get the file input (hidden)
        const fileInput = page.locator('input[type="file"]');

        // Upload the sample CSV file
        const csvPath = join(__dirname, '..', '..', 'src', 'lib', 'parsers', '__fixtures__', 'garmin-sample.csv');

        await fileInput.setInputFiles(csvPath);

        // Wait for dashboard to appear
        await expect(page.getByRole('heading', { name: 'Your 2025' })).toBeVisible({ timeout: 10000 });

        // Check core stats are displayed
        await expect(page.getByText('Total Distance').first()).toBeVisible();
        await expect(page.getByText('Time Active').first()).toBeVisible();
        await expect(page.getByText('Calories Burned').first()).toBeVisible();
        await expect(page.getByText('Elevation Gained').first()).toBeVisible();

        // Check derived metrics
        await expect(page.getByText(/around the globe/).first()).toBeVisible();
        await expect(page.getByText(/Everest/).first()).toBeVisible();
    });

    test('allows uploading a different file', async ({ page }) => {
        await page.goto('/');

        const fileInput = page.locator('input[type="file"]');
        const csvPath = join(__dirname, '..', '..', 'src', 'lib', 'parsers', '__fixtures__', 'garmin-sample.csv');

        await fileInput.setInputFiles(csvPath);

        // Wait for dashboard
        await expect(page.getByRole('heading', { name: 'Your 2025' })).toBeVisible({ timeout: 10000 });

        // Click reset button
        await page.getByRole('button', { name: 'Upload different file' }).click();

        // Should be back to upload state
        await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
    });
});
