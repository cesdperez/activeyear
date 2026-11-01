import { test, expect } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { DASHBOARD_HEADING, uploadSample } from './helpers.js';

test.describe('Upload Flow', () => {
	test('home page displays upload UI', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'ActiveYear' })).toBeVisible();
		await expect(page.getByText(`${DASHBOARD_HEADING} in Sport`)).toBeVisible();

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
		await expect(page.getByText('Your data never leaves this browser')).toBeVisible();
	});

	test('shows instructions for getting data', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText('How to get your data')).toBeVisible();
		await expect(page.getByText('connect.garmin.com')).toBeVisible();
		await expect(
			page.getByText(`Scroll down until all ${TARGET_YEAR} activities are loaded`)
		).toBeVisible();
	});

	test('processes uploaded CSV and shows dashboard', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByText('Total Distance').first()).toBeVisible();
		await expect(page.getByText('Time Active').first()).toBeVisible();
		await expect(page.getByText('Calories Burned').first()).toBeVisible();
		await expect(page.getByText('Elevation Gained').first()).toBeVisible();

		await expect(page.getByText(/around the globe/).first()).toBeVisible();
		await expect(page.getByText(/Everest/).first()).toBeVisible();
	});

	test('allows uploading a different file', async ({ page }) => {
		await uploadSample(page);

		await page.getByRole('button', { name: 'Upload different file' }).click();

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
	});

	test('explains why an export without target year activities was rejected', async ({ page }) => {
		await page.goto('/');

		await page.locator('input[type="file"]').setInputFiles({
			name: 'activities.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(
				`Activity Type,Date,Title,Distance\nRunning,${TARGET_YEAR - 1}-03-01 08:00:00,Run,10.0`
			)
		});

		await expect(page.getByText(`No ${TARGET_YEAR} activities found in the file`)).toBeVisible({
			timeout: 10000
		});
		await expect(page.getByText('Click to try again')).toBeVisible();
	});
});
