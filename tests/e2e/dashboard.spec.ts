import { readFileSync } from 'fs';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import {
	DASHBOARD_HEADING,
	SAMPLE_CSV,
	garminCsv,
	gotoUpload,
	soFarCsv,
	uploadCsv
} from './helpers.js';

const DAYS_IN_TARGET_YEAR =
	(Date.UTC(TARGET_YEAR + 1, 0, 1) - Date.UTC(TARGET_YEAR, 0, 1)) / 86_400_000;

async function openDemo(page: Page): Promise<void> {
	// After the season, so the demo is its whole fixed year.
	await page.clock.setFixedTime(new Date(TARGET_YEAR + 1, 0, 15));
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
	test.use({ reducedMotion: 'no-preference' });

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

test('every page ends with a footer linking to issues and other projects', async ({ page }) => {
	const expectFooterLinks = async () => {
		const footer = page.getByRole('contentinfo');
		await expect(footer.getByRole('link', { name: /Report an issue/ })).toHaveAttribute(
			'href',
			'https://github.com/cesdperez/activeyear/issues'
		);
		await expect(footer.getByRole('link', { name: /See my other projects/ })).toHaveAttribute(
			'href',
			'https://checho.xyz'
		);
		return footer;
	};
	await gotoUpload(page);
	const landingFooter = await expectFooterLinks();
	await expect(landingFooter.getByText('Enjoying ActiveYear?')).toBeVisible();
	await expect(landingFooter.getByRole('link', { name: /Buy me a gel/ })).toBeVisible();
	await openDemo(page);
	const dashboardFooter = await expectFooterLinks();
	await expect(dashboardFooter.getByText('Enjoying ActiveYear?')).toBeVisible();
	const support = dashboardFooter.getByRole('link', { name: /Buy me a gel/ });
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

test('weekday and sport bars keep their fill in forced colors mode', async ({ page }) => {
	await openDemo(page);
	const fills = () =>
		page
			.locator('[data-testid="weekly-pattern-bar"], [data-testid="sport-breakdown"] .bar-fill')
			.evaluateAll((bars) => bars.map((bar) => getComputedStyle(bar).backgroundColor));
	const normal = await fills();
	expect(normal.length).toBeGreaterThan(7);
	await page.emulateMedia({ forcedColors: 'active' });
	expect(await fills()).toEqual(normal);
});

test('more stats mark every empty value the same way', async ({ page }) => {
	await uploadCsv(
		page,
		garminCsv([{ title: 'Run' }, { title: 'Gym', type: 'Strength Training', distance: '0.0' }])
	);
	await page.getByRole('button', { name: 'More stats', exact: true }).click();
	const section = page.getByTestId('more-stats');
	const emptyCells = section.locator('td').filter({ hasText: /^(|0\.0km|0m)$/ });
	await expect(emptyCells).toHaveCount(0);
	const marked = section.locator('td').filter({ hasText: '–' });
	await expect(marked.first()).toHaveText('–No data');
	// Five empty weekdays, plus the gym day and the gym average without distance.
	await expect(marked).toHaveCount(5 * 2 + 2);
});

test('more stats leave out the longest break with a single active day', async ({ page }) => {
	await uploadCsv(page, garminCsv([{ title: 'Morning run' }]));
	await page.getByRole('button', { name: 'More stats', exact: true }).click();
	const section = page.getByTestId('more-stats');
	await expect(section.getByRole('heading', { name: 'Quarters' })).toBeVisible();
	await expect(section.getByRole('heading', { name: 'Longest break' })).toHaveCount(0);
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

for (const width of [640, 768, 820, 1024, 1280]) {
	test(`results board values stay well above label size at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await openDemo(page);
		const board = page.getByTestId('main-stats');
		const labelSize = await board
			.locator('dt')
			.first()
			.evaluate((label) => parseFloat(getComputedStyle(label).fontSize));
		const valueSize = await board
			.getByTestId('board-value')
			.first()
			.evaluate((value) => parseFloat(getComputedStyle(value).fontSize));

		expect(valueSize).toBeGreaterThanOrEqual(labelSize * 1.6);
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

test('Back to start stays in view at the bottom of the dashboard', async ({ page }) => {
	await openDemo(page);
	await page.locator('[data-support-placement="footer"]').scrollIntoViewIfNeeded();
	await expect(page.getByRole('button', { name: 'Back to start' })).toBeInViewport();
});

test('clicking the sport metric below Back to start selects it', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openDemo(page);
	const time = page
		.getByTestId('sport-breakdown')
		.getByRole('button', { name: 'Time', exact: true });
	await time.evaluate((el) =>
		window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100)
	);
	await expect(time).toHaveAttribute('aria-pressed', 'false');
	await time.click();
	await expect(time).toHaveAttribute('aria-pressed', 'true');
});

for (const width of [390, 1440]) {
	test(`section headings clear Back to start on focus at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
		await page.goto('/');
		await page.getByRole('button', { name: /demo data/i }).click();
		const back = page.getByRole('button', { name: 'Back to start' });
		for (const [heading, control] of [
			[
				page.getByRole('heading', { name: 'Highlights' }),
				page.getByRole('searchbox', { name: 'Add an activity' })
			],
			[
				page.getByRole('heading', { name: 'By sport' }),
				page.getByTestId('sport-breakdown').getByRole('button').first()
			]
		] as const) {
			await control.evaluate((el) =>
				window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 50)
			);
			await page.keyboard.press('Tab');
			await control.focus();
			await expect
				.poll(async () => {
					const a = await back.boundingBox();
					const b = await heading.boundingBox();
					return a && b ? b.y - (a.y + a.height) : -Infinity;
				})
				.toBeGreaterThanOrEqual(0);
		}
	});

	test(`wrapped section headings clear Back to start on focus at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
		await openDemo(page);
		const heading = page.getByRole('heading', { name: 'By sport' });
		await heading.evaluate((el) => (el.style.maxWidth = '5ch'));
		await expect
			.poll(() =>
				heading.evaluate(
					(el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)
				)
			)
			.toBeGreaterThanOrEqual(2);
		const control = page.getByTestId('sport-breakdown').getByRole('button').first();
		await control.evaluate((el) =>
			window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 50)
		);
		await page.keyboard.press('Tab');
		await control.focus();
		await expect
			.poll(async () => {
				const back = await page.getByRole('button', { name: 'Back to start' }).boundingBox();
				const title = await heading.boundingBox();
				return back && title ? title.y - (back.y + back.height) : -Infinity;
			})
			.toBeGreaterThanOrEqual(0);
		await expect(control).toBeInViewport();
	});

	test(`focus deeper in a section does not scroll back to its heading at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
		await openDemo(page);
		const control = page.getByTestId('highlight-row').last().getByRole('button');
		await control.evaluate((el) =>
			window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100)
		);
		const scrollY = await page.evaluate(() => window.scrollY);
		await control.focus();
		await expect(control).toBeFocused();
		expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
	});
}

test('uploaded year shows progress so far', async ({ page }) => {
	await gotoUpload(page, '/', new Date(TARGET_YEAR, 7, 15));
	await page.locator('input[type="file"]').setInputFiles({
		name: 'activities.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(soFarCsv())
	});
	await expect(page.getByRole('heading', { name: `Your ${TARGET_YEAR} so far` })).toBeVisible();
	await expect(page.locator('#export-card')).toContainText(`Season ${TARGET_YEAR} so far`);
	await expect(page.getByTestId('main-stats')).toContainText('18% of the year so far');
	await expect(page.getByTestId('year-lane').first().getByRole('img')).toHaveAttribute(
		'aria-label',
		/out of 227 in .* so far/
	);
});

test('uploaded finished year has no so far labels', async ({ page }) => {
	await page.clock.setFixedTime(new Date(TARGET_YEAR + 1, 0, 15));
	await page.goto('/');
	await expect(page.locator('#upload-zone')).not.toHaveAttribute('aria-disabled', 'true');
	await page.locator('input[type="file"]').setInputFiles(SAMPLE_CSV);
	await expect(
		page.getByRole('heading', { name: `Your ${TARGET_YEAR}`, exact: true })
	).toBeVisible();
	await expect(page.locator('body')).not.toContainText('so far');
});

test('back to start returns focus to the upload zone', async ({ page }) => {
	await openDemo(page);
	await page.getByRole('button', { name: 'Back to start' }).click();
	await expect(page.locator('#upload-zone')).toBeFocused();
});

test('browser back returns to the start screen in the same language', async ({ page }) => {
	await page.goto('/es/');
	await page.getByTestId('demo-data').filter({ visible: true }).click();
	await expect(page.locator('h1').filter({ hasText: String(TARGET_YEAR) })).toBeVisible();
	await page.goBack();
	await expect(page.locator('#upload-zone')).toBeVisible();
	await expect(page).toHaveURL(/\/es\/$/);
});

test('switching language keeps the dashboard until Back to start', async ({ page }) => {
	await openDemo(page);
	await page.getByRole('button', { name: 'EN, language: English' }).click();
	await page.getByRole('menuitem', { name: 'Español' }).click();
	await expect(page).toHaveURL(/\/es\/$/);
	await expect(page.getByRole('button', { name: 'Volver al inicio' })).toBeVisible();
	await page.getByRole('button', { name: 'Volver al inicio' }).click();
	await expect(page.locator('#upload-zone')).toBeFocused();
	await expect(page).toHaveURL(/\/es\/$/);
});

test('the top bar is a banner landmark', async ({ page }) => {
	await openDemo(page);
	const banner = page.getByRole('banner');
	await expect(banner.getByRole('button', { name: 'Back to start' })).toBeVisible();
	await expect(banner.getByRole('button', { name: 'EN, language: English' })).toBeVisible();
});

test('jump to export leaves room above the export heading', async ({ page }) => {
	await openDemo(page);
	await page.getByRole('button', { name: 'Jump to Export' }).click();
	const heading = page.locator('#export-panel h2');
	await expect(heading).toBeFocused();
	const back = (await page.getByRole('button', { name: 'Back to start' }).boundingBox())!;
	await expect
		.poll(async () => (await heading.boundingBox())!.y)
		.toBeGreaterThanOrEqual(back.y + back.height);
});

test('celebration mode is hidden under reduced motion', async ({ page }) => {
	await openDemo(page);
	await expect(page.getByRole('button', { name: 'Celebration confetti' })).toHaveCount(0);
});

test.describe('with motion', () => {
	test.use({ reducedMotion: 'no-preference' });

	test('back to start ends celebration mode', async ({ page }) => {
		await openDemo(page);
		const confetti = page.getByRole('button', { name: 'Celebration confetti' });
		await expect(confetti).toHaveAttribute('title', 'Celebration confetti');
		await confetti.click();
		await expect(page.locator('body > canvas')).toHaveCount(1);
		await page.getByRole('button', { name: 'Back to start' }).click();
		await expect(page.locator('body > canvas')).toHaveCount(0);
		await page.getByTestId('demo-data').filter({ visible: true }).click();
		await expect(confetti).toHaveAttribute('aria-pressed', 'false');
	});
});
