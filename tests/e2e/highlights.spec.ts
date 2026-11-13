import { expect, test, type Page } from '@playwright/test';
import {
	DASHBOARD_HEADING,
	garminCsv,
	gotoUpload,
	showSlide,
	STRAVA_CSV,
	uploadCsv,
	uploadSample
} from './helpers.js';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';

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
		const search = section.getByRole('searchbox', { name: 'Add an activity' });
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
		await section
			.getByRole('button', { name: new RegExp(`^Remove ${title}, .+, from highlights$`) })
			.click();
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

const twelveTempos = () =>
	garminCsv(Array.from({ length: 12 }, (_, i) => ({ title: `Tempo ${i + 1}` })));

function highlightsSection(page: Page) {
	return page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Highlights', exact: true }) });
}

test('search shows how many activities matched and separates each figure', async ({ page }) => {
	await uploadCsv(page, twelveTempos());
	const section = highlightsSection(page);
	await expect(section.getByText('Add an activity', { exact: true })).toBeVisible();
	const search = section.getByRole('searchbox', { name: 'Add an activity' });
	await search.fill('tempo');
	await expect(
		section.getByText('Showing 8 of 12. Add words to narrow it down.', { exact: true })
	).toBeVisible();
	await expect(section.locator('li button').first()).toContainText('10.0km, 50m, Running');
});

test('at the highlight limit the search says so and results stay reachable', async ({ page }) => {
	await uploadCsv(page, twelveTempos());
	const section = highlightsSection(page);
	const search = section.getByRole('searchbox', { name: 'Add an activity' });
	await expect(search).toHaveAccessibleDescription(/10 highlights max/);
	await search.fill('tempo 12');
	const result = section.locator('li button').filter({ hasText: 'Tempo 12' });
	await expect(result).toHaveAttribute('aria-disabled', 'true');
	await search.press('Tab');
	await expect(result).toBeFocused();
});

test('removing a highlight announces it and keeps focus in the list', async ({ page }) => {
	await uploadCsv(page, twelveTempos());
	const section = highlightsSection(page);
	await section.getByRole('button', { name: 'Remove Tempo 1, Mar 1, from highlights' }).click();
	await expect(
		section.getByRole('button', { name: 'Remove Tempo 2, Mar 2, from highlights' })
	).toBeFocused();
	await expect(section.locator('[aria-live]')).toHaveText('Removed Tempo 1');
	await section.getByRole('button', { name: 'Remove Tempo 10, Mar 10, from highlights' }).click();
	await expect(section.getByRole('searchbox', { name: 'Add an activity' })).toBeFocused();
});

test('remove buttons tell highlights with the same title apart by date', async ({ page }) => {
	await uploadCsv(
		page,
		garminCsv(Array.from({ length: 3 }, () => ({ title: 'Eindhoven Road Cycling' })))
	);
	const names = await highlightsSection(page)
		.getByRole('button', { name: /^Remove Eindhoven Road Cycling/ })
		.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')));

	expect(names).toEqual([
		'Remove Eindhoven Road Cycling, Mar 1, from highlights',
		'Remove Eindhoven Road Cycling, Mar 2, from highlights',
		'Remove Eindhoven Road Cycling, Mar 3, from highlights'
	]);
});

for (const width of [375, 390]) {
	test(`biggest climbs keeps each row's three figures on one line at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		const rows = Array.from(
			{ length: 5 },
			(_, i) =>
				`Cycling,${TARGET_YEAR}-06-0${i + 1} 08:00:00,false,Ride ${i + 1},175.3,3000,05:53:00,"2,34${i}"`
		);
		await uploadCsv(
			page,
			['Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent', ...rows].join('\n')
		);
		const section = highlightsSection(page);
		await section.getByRole('button', { name: 'Biggest climbs' }).click();
		await expect(section.getByTestId('highlight-row').first()).toContainText('5h 53m');

		const lines = () =>
			section
				.getByTestId('highlight-row')
				.evaluateAll((items) =>
					items.map(
						(item) =>
							new Set(
								[...item.querySelector('.figures')!.children].map((figure) =>
									Math.round(figure.getBoundingClientRect().top)
								)
							).size
					)
				);
		await expect.poll(lines).toEqual([1, 1, 1, 1, 1]);
	});
}

test('biggest climbs shows each climb', async ({ page }) => {
	await uploadCsv(page, twelveTempos());
	const section = highlightsSection(page);
	await section.getByRole('button', { name: 'Biggest climbs' }).click();
	await expect(section.getByTestId('highlight-row').first()).toContainText('100m');
});
