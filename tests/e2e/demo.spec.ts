import { test, expect } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { DASHBOARD_HEADING } from './helpers.js';

test('during the season the demo stops at today', async ({ page }) => {
	await page.clock.setFixedTime(new Date(TARGET_YEAR, 5, 10, 9));
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();

	await expect(page.getByRole('heading', { name: `Your ${TARGET_YEAR} so far` })).toBeVisible();
	await expect(page.getByText('Demo data', { exact: true })).toBeVisible();
	const dates = await page.getByTestId('highlight-row').locator('.date').allTextContents();
	for (const date of dates) expect(date).toMatch(/^(Jan|Feb|Mar|Apr|May|Jun) /);
});

test('demo link fills the dashboard with demo data', async ({ page }) => {
	await page.clock.setFixedTime(new Date(TARGET_YEAR + 1, 0, 15));
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();

	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	await expect(page.getByText('Demo data', { exact: true })).toBeVisible();
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

test('phone visitors see the demo before upload, desktop visitors see it after', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const hint = page.getByText('Export on a computer, or try the demo.');
	const demo = page.getByRole('button', { name: /demo data/i });
	const upload = page.locator('.upload-zone');
	await expect(demo).toHaveCount(1);
	await expect(hint).toBeVisible();
	const mobileDemo = (await demo.boundingBox())!;
	const mobileUpload = (await upload.boundingBox())!;
	expect(mobileDemo.y + mobileDemo.height).toBeLessThan(mobileUpload.y);
	expect(mobileDemo.y + mobileDemo.height).toBeLessThanOrEqual(844);
	await demo.click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await expect(hint).toBeHidden();
	await expect(demo).toHaveCount(1);
	await expect(demo).toHaveCSS('border-top-width', '0px');
	const desktopDemo = (await demo.boundingBox())!;
	const desktopUpload = (await upload.boundingBox())!;
	expect(desktopDemo.y).toBeGreaterThan(desktopUpload.y + desktopUpload.height);
});

test('landing fits phone widths without wrapping the wordmark or tagline', async ({ page }) => {
	for (const width of [375, 390]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		const dimensions = await page.evaluate(() => {
			const header = document.querySelector('main header')!;
			const title = header.querySelector('[aria-label=ActiveYear]')!;
			const tagline = header.querySelector('p')!;
			return {
				overflow: document.documentElement.scrollWidth > window.innerWidth,
				titleHeight: title.getBoundingClientRect().height,
				titleLineHeight: parseFloat(getComputedStyle(title).lineHeight),
				taglineHeight: tagline.getBoundingClientRect().height,
				taglineLineHeight: parseFloat(getComputedStyle(tagline).lineHeight)
			};
		});
		expect(dimensions.overflow).toBe(false);
		expect(dimensions.titleHeight).toBeLessThanOrEqual(dimensions.titleLineHeight * 1.1);
		expect(dimensions.taglineHeight).toBeLessThanOrEqual(dimensions.taglineLineHeight * 1.1);
	}
});
