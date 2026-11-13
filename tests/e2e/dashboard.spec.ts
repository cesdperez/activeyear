import { readFileSync } from 'fs';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { DASHBOARD_HEADING, SAMPLE_CSV, garminCsv, gotoUpload, uploadCsv } from './helpers.js';

const DAYS_IN_TARGET_YEAR =
	(Date.UTC(TARGET_YEAR + 1, 0, 1) - Date.UTC(TARGET_YEAR, 0, 1)) / 86_400_000;

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

test('footer offers a support link', async ({ page }) => {
	await openDemo(page);
	const support = page.getByRole('link', { name: /Buy me a gel/ });
	await expect(support).toBeVisible();
	await expect(support).toHaveAttribute('href', 'https://ko-fi.com/chechoxyz');
});

test('more stats are hidden until expanded', async ({ page }) => {
	await openDemo(page);
	const toggle = page.getByRole('button', { name: 'More stats', exact: true });
	const section = page.getByTestId('more-stats');
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(section).not.toBeVisible();
	await toggle.click();
	await expect(page.getByRole('button', { name: 'Fewer stats' })).toHaveAttribute(
		'aria-expanded',
		'true'
	);
	await expect(section).toBeVisible();
	await expect(section.getByRole('heading', { name: 'More stats' })).toBeVisible();
	for (const quarter of ['Q1', 'Q2', 'Q3', 'Q4']) {
		await expect(section.getByRole('heading', { name: quarter, exact: true })).toBeVisible();
	}
});

test('Jump to Export moves focus to the export heading', async ({ page }) => {
	await openDemo(page);
	await page.getByRole('button', { name: 'Jump to Export' }).click();
	await expect(page.getByRole('heading', { name: 'Export', exact: true })).toBeFocused();
});

test('Jump to Export from the keyboard focuses the export heading without a focus ring', async ({
	page
}) => {
	await openDemo(page);
	await page.getByRole('button', { name: 'Jump to Export' }).focus();
	await page.keyboard.press('Enter');
	const heading = page.getByRole('heading', { name: 'Export', exact: true });
	await expect(heading).toBeFocused();
	await expect(heading).toHaveCSS('outline-style', 'none');
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
		.evaluateAll((bars) => bars.map((bar) => getComputedStyle(bar).backgroundColor));
	expect(fills).toHaveLength(7);
	for (const fill of fills) expect(fill).not.toBe('rgba(0, 0, 0, 0)');
});

test('the headline number shows its final value at once when reduced motion is preferred', async ({
	page
}) => {
	await openDemo(page);
	await expect(page.getByTestId('headline-value')).toHaveText('2,032km');
});

test('the headline number counts up through smaller values to its exact total', async ({
	browser
}) => {
	const context = await browser.newContext({ reducedMotion: 'no-preference' });
	const page = await context.newPage();
	// Every frame of the count-up is a DOM change, so recording mutations cannot miss one.
	await page.addInitScript(() => {
		const shown: string[] = [];
		Object.assign(window, { headlineValues: shown });
		new MutationObserver(() => {
			const text = document.querySelector('[data-testid="headline-value"]')?.textContent?.trim();
			if (text && text !== shown.at(-1)) shown.push(text);
		}).observe(document, { subtree: true, childList: true, characterData: true });
	});
	await openDemo(page);
	await expect(page.getByTestId('headline-value')).toHaveText('2,032km');

	const shown = await page.evaluate(
		() => (window as unknown as { headlineValues: string[] }).headlineValues
	);
	expect(shown.at(-1)).toBe('2,032km');
	expect(shown.slice(0, -1).filter((value) => /[1-9]/.test(value)).length).toBeGreaterThan(0);
	await context.close();
});

test('the year lane counts its active days out of every day of the year and names its marks', async ({
	page
}) => {
	await openDemo(page);
	const lane = page.getByTestId('year-lane').first().getByRole('img');
	await expect(lane).toHaveAccessibleName(
		`180 active days out of ${DAYS_IN_TARGET_YEAR} in ${TARGET_YEAR}, highlights marked, personal records marked`
	);
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
			await overflowingElements(
				page.getByTestId('main-stats').getByTestId(/^(headline|board)-value$/)
			)
		).toEqual([]);
		expect(await overflowingElements(page.getByTestId('record-value'))).toEqual([]);
		expect(await overflowingElements(page.getByTestId('weekly-pattern-row'))).toEqual([]);
	});

	test(`results board values share one font size at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await openDemo(page);
		const sizes = await page
			.getByTestId('board-value')
			.evaluateAll((values) => values.map((value) => getComputedStyle(value).fontSize));
		expect(sizes).toHaveLength(5);
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
