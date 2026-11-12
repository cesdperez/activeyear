import { readFileSync } from 'fs';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { DASHBOARD_HEADING, SAMPLE_CSV, garminCsv, gotoUpload, uploadCsv } from './helpers.js';

async function openDemo(page: Page): Promise<void> {
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
}

async function overflowingElements(locator: Locator): Promise<string[]> {
	await expect(locator.first()).toBeAttached();
	return locator.evaluateAll((elements) =>
		elements
			.filter((el) => el.scrollWidth > el.clientWidth)
			.map((el) => `${el.textContent?.trim()} (${el.scrollWidth} > ${el.clientWidth})`)
	);
}

test.describe('dashboard toggles', () => {
	test('unit, breakdown metric and confetti toggles expose their pressed state', async ({
		page
	}) => {
		await openDemo(page);
		const km = page.getByRole('button', { name: 'km', exact: true });
		const mi = page.getByRole('button', { name: 'mi', exact: true });
		await expect(km).toHaveAttribute('aria-pressed', 'true');
		await expect(mi).toHaveAttribute('aria-pressed', 'false');
		await mi.click();
		await expect(km).toHaveAttribute('aria-pressed', 'false');
		await expect(mi).toHaveAttribute('aria-pressed', 'true');

		const breakdown = page.getByTestId('sport-breakdown');
		const activities = breakdown.getByRole('button', { name: 'Activities', exact: true });
		const time = breakdown.getByRole('button', { name: 'Time', exact: true });
		await expect(activities).toHaveAttribute('aria-pressed', 'true');
		await time.click();
		await expect(activities).toHaveAttribute('aria-pressed', 'false');
		await expect(time).toHaveAttribute('aria-pressed', 'true');

		const confetti = page.getByRole('button', { name: 'Celebration confetti' });
		const before = await confetti.getAttribute('aria-pressed');
		expect(['true', 'false']).toContain(before);
		await confetti.click();
		await expect(confetti).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
	});

	test('pressed toggles stay distinguishable in forced colors mode', async ({ page }) => {
		await page.emulateMedia({ forcedColors: 'active' });
		await openDemo(page);
		// Forced colours repaint every background as Canvas, so only a system colour override shows.
		const pressedStandsOut = (name: string) =>
			page
				.getByRole('button', { name, exact: true })
				.and(page.locator(':not(#export-panel *)'))
				.evaluate((el) => {
					const own = getComputedStyle(el).backgroundColor;
					return own !== getComputedStyle(el.parentElement!).backgroundColor;
				});

		expect(await pressedStandsOut('km')).toBe(true);
		expect(await pressedStandsOut('Activities')).toBe(true);
	});
});

test('Jump to Export moves focus to the export heading', async ({ page }) => {
	await openDemo(page);
	await page.getByRole('button', { name: 'Jump to Export' }).click();
	await expect(page.getByRole('heading', { name: 'Export', exact: true })).toBeFocused();
});

test('dashboard icons outside the export panel are hidden from assistive tech', async ({
	page
}) => {
	await openDemo(page);
	const exposedIcons = await page
		.locator('svg[role="img"]:not([aria-hidden="true"]):not([aria-label])')
		.evaluateAll(
			(icons) => icons.filter((icon) => !icon.closest('#export-panel, footer, nav')).length
		);
	expect(exposedIcons).toBe(0);
});

test('every weekly pattern bar has a fill', async ({ page }) => {
	await openDemo(page);
	const fills = await page
		.getByTestId('weekly-pattern-bar')
		.evaluateAll((bars) => bars.map((bar) => getComputedStyle(bar).backgroundImage));
	expect(fills).toHaveLength(7);
	for (const fill of fills) expect(fill).not.toBe('none');
});

test('stat cards show values instantly when reduced motion is preferred', async ({ page }) => {
	await openDemo(page);
	const opacities = await page
		.locator('[data-testid="main-stats"] > *, [data-testid="personal-records"] .pr-card')
		.evaluateAll((cards) => cards.map((card) => (card as HTMLElement).style.opacity));
	expect(opacities.length).toBeGreaterThan(0);
	for (const opacity of opacities) expect(opacity).toBe('1');
});

test('summary uses singular nouns for a single activity on a single day', async ({ page }) => {
	const [header, firstActivity] = readFileSync(SAMPLE_CSV, 'utf8').split('\n');
	await gotoUpload(page);
	await page.locator('input[type="file"]').setInputFiles({
		name: 'one.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(`${header}\n${firstActivity}\n`)
	});
	await expect(page.getByTestId('activity-summary')).toHaveText(
		/^\s*1\s+activity across\s+1\s+active day\s*$/,
		{ timeout: 10000 }
	);
});

for (const width of [320, 360, 768, 1024, 1280, 1920]) {
	test(`dashboard values fit their cards at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await openDemo(page);

		expect(
			await overflowingElements(page.locator('[data-testid="main-stats"] .stat-value'))
		).toEqual([]);
		expect(
			await overflowingElements(page.locator('[data-testid="personal-records"] .stat-value'))
		).toEqual([]);
		expect(
			await overflowingElements(page.getByTestId('consistency-stats').locator('.stat-card'))
		).toEqual([]);
		expect(await overflowingElements(page.getByTestId('weekly-pattern-row'))).toEqual([]);
	});

	test(`main stat values share one font size at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await openDemo(page);
		const sizes = await page
			.locator('[data-testid="main-stats"] .stat-value')
			.evaluateAll((values) => values.map((value) => getComputedStyle(value).fontSize));
		expect(sizes).toHaveLength(4);
		expect(new Set(sizes).size).toBe(1);
	});
}

const LONG_TITLES = [
	"New Year's Resolution Run",
	'Sunday long run with the club along the river',
	'Hill repeats before work'
];

for (const width of [320, 1024, 1280]) {
	test(`highlight and record titles are fully visible at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await uploadCsv(
			page,
			garminCsv(
				LONG_TITLES.map((title, i) => ({ title, favorite: true, distance: `${10 + i * 5}.0` }))
			)
		);

		const { shown, clipped } = await page.locator('main').evaluate((main, titles) => {
			const leaves = [...main.querySelectorAll('*')].filter(
				(el) =>
					!el.closest('#export-panel') &&
					el.children.length === 0 &&
					titles.includes(el.textContent?.trim() ?? '')
			);
			return {
				shown: leaves.length,
				clipped: leaves
					.filter((el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
					.map((el) => el.textContent?.trim())
			};
		}, LONG_TITLES);
		expect(shown).toBeGreaterThan(LONG_TITLES.length);
		expect(clipped).toEqual([]);
	});
}

test('Upload different file button is named without its decorative glyph', async ({ page }) => {
	await openDemo(page);
	await expect(
		page.getByRole('button', { name: 'Upload different file', exact: true })
	).toBeVisible();
});
