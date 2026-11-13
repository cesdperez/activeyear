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
		await expect(section.locator('.stat-card').first()).toBeVisible();
		const search = section.getByRole('searchbox', { name: 'Search your activities' });
		await search.fill(source === 'Garmin' ? 'Indoor Cycling' : 'Evening Yoga');
		const result = section.locator('li button').first();
		await expect(result).toBeVisible();
		if ((await result.getAttribute('aria-pressed')) === 'true') await result.click();
		if (await result.isDisabled())
			await section
				.getByRole('button', { name: /^Remove .* from highlights$/ })
				.first()
				.click();
		await result.click();
		await expect(section.getByText('Your own picks.')).toBeVisible();
		await expect(result).toHaveAttribute('aria-pressed', 'true');
		await section
			.getByRole('button', { name: /^Remove .* from highlights$/ })
			.first()
			.click();
		await chips.getByRole('button', { name: 'Farthest' }).click();
		await expect(chips.getByRole('button', { name: 'Farthest' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expect(section.getByText('The days you went the distance.')).toBeVisible();
		const titles = await section.locator('.stat-card span[title]').allTextContents();
		await showSlide(page, 2);
		const cardTitles = page.locator('#export-card .highlight-title');
		await expect(cardTitles.first()).toBeVisible();
		for (const title of await cardTitles.allTextContents())
			expect(titles.map((t) => t.trim())).toContain(title.trim());
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
