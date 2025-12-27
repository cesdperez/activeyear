import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test.describe('Upload Flow', () => {
    test('home page displays upload UI', async ({ page }) => {
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
        await expect(page.getByText('Your 2025')).toBeVisible({ timeout: 5000 });

        // Check core stats are displayed
        await expect(page.getByText('Total Distance')).toBeVisible();
        await expect(page.getByText('Time Active')).toBeVisible();
        await expect(page.getByText('Calories Burned')).toBeVisible();
        await expect(page.getByText('Elevation Gained')).toBeVisible();

        // Check derived metrics
        await expect(page.getByText('Earth Laps')).toBeVisible();
        await expect(page.getByText('Everests Climbed')).toBeVisible();
        await expect(page.getByText('Pizza Slices Burned')).toBeVisible();
    });

    test('allows uploading a different file', async ({ page }) => {
        await page.goto('/');

        const fileInput = page.locator('input[type="file"]');
        const csvPath = join(__dirname, '..', '..', 'src', 'lib', 'parsers', '__fixtures__', 'garmin-sample.csv');

        await fileInput.setInputFiles(csvPath);

        // Wait for dashboard
        await expect(page.getByText('Your 2025')).toBeVisible({ timeout: 5000 });

        // Click reset button
        await page.getByRole('button', { name: 'Upload different file' }).click();

        // Should be back to upload state
        await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
    });
});
