import { test, expect } from '@playwright/test';
import { DASHBOARD_HEADING } from './helpers.js';

test('demo link fills the dashboard with demo data', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();

	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	await expect(page.getByTestId('activity-summary')).toHaveText(
		/245\s+activities across\s+180\s+active days/
	);

	const mainStats = page.getByTestId('main-stats');
	for (const label of ['Total Distance', 'Elevation Gained', 'Time Active', 'Calories Burned']) {
		await expect(mainStats.getByText(label)).toBeVisible();
	}

	const sportBreakdown = page.getByTestId('sport-breakdown');
	for (const sport of ['Running', 'Strength', 'Cycling']) {
		await expect(sportBreakdown.getByText(sport, { exact: true })).toBeVisible();
	}

	const records = page.getByTestId('personal-records');
	await expect(records.getByText('Century Ride Achievement').first()).toBeVisible();
	await expect(records.getByText('Summit Sunrise Hike')).toBeVisible();
});
