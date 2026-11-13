import { expect, test, type Page } from '@playwright/test';
import { DASHBOARD_HEADING, gotoUpload, showSlide, STRAVA_CSV, uploadSample } from './helpers.js';

async function uploadStrava(page: Page) {
	await gotoUpload(page);
	await page.locator('input[type="file"]').setInputFiles(STRAVA_CSV);
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
}

for (const source of ['Garmin', 'Strava'] as const) {
	test(`${source} highlights can be picked and exported`, async ({ page }) => {
		if (source === 'Garmin') await uploadSample(page);
		else await uploadStrava(page);
		const section = page
			.locator('section')
			.filter({ has: page.getByRole('heading', { name: 'Highlights', exact: true }) });
		const chips = section.getByRole('group', { name: 'Highlight presets' });
		await expect(chips.getByRole('button', { name: 'Longest' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expect(section.getByTestId('highlight-row').first()).toBeVisible();
		const search = section.getByRole('searchbox', { name: 'Search your activities' });
		await chips.getByRole('button', { name: 'Biggest climbs' }).click();
		const title = source === 'Garmin' ? 'Indoor Cycling' : 'Evening Yoga';
		const nonMatch = source === 'Garmin' ? 'Sample Running' : 'Morning Swim';
		await search.fill(title);
		const result = section.locator('li button').filter({ hasText: title }).first();
		await expect(result).toBeVisible();
		await expect(section.locator('li button').filter({ hasText: nonMatch })).toHaveCount(0);
		await expect(result).toHaveAttribute('aria-pressed', 'false');
		await result.click();
		await expect(section.getByText('Your own picks.')).toBeVisible();
		await expect(result).toHaveAttribute('aria-pressed', 'true');
		const titles = (await section.getByTestId('highlight-title').allTextContents()).map((t) =>
			t.trim()
		);
		await showSlide(page, 2);
		await expect(page.locator('#export-card .highlight-title')).toHaveText(titles);
		await section.getByRole('button', { name: `Remove ${title} from highlights` }).click();
		await expect(section.getByTestId('highlight-title').filter({ hasText: title })).toHaveCount(0);
		await expect(
			page.locator('#export-card .highlight-title').filter({ hasText: title })
		).toHaveCount(0);
		await chips.getByRole('button', { name: 'Farthest' }).click();
		await expect(chips.getByRole('button', { name: 'Farthest' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expect(section.getByText('The days you went the distance.')).toBeVisible();
	});
}

test('presets and search work with a keyboard on mobile', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await uploadSample(page);
	const section = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Highlights', exact: true }) });
	const longest = section.getByRole('button', { name: 'Longest', exact: true });
	await longest.focus();
	await page.keyboard.press('Tab');
	await page.keyboard.press('Space');
	await expect(section.getByRole('button', { name: 'Farthest' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	const search = section.getByRole('searchbox');
	while (!(await search.evaluate((el) => el === document.activeElement)))
		await page.keyboard.press('Tab');
	await page.keyboard.type('Indoor Cycling');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	await expect(section.getByText('Your own picks.')).toBeVisible();
});
