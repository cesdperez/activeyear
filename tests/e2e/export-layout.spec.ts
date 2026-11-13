import { test, expect, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { garminCsv, overflowingCardElements, showSlide, uploadCsv } from './helpers.js';

const CARDS = ['summary', 'breakdown', 'highlights'] as const;

const favourites = (count: number, title: (i: number) => string) =>
	Array.from({ length: count }, (_, i) => ({ title: title(i), favorite: true }));

/** Text and icons in the export card that fall below WCAG contrast on the background behind them. */
function lowContrastText(page: Page): Promise<string[]> {
	return page.locator('#export-card').evaluate((cardEl) => {
		const cardBackground = [250, 250, 249];
		const luminance = (rgb: number[]) => {
			const [r, g, b] = rgb.map((c) => {
				const s = c / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			});
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const channels = (color: string) => {
			const [r, g, b, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
			return { rgb: [r, g, b], alpha: a };
		};
		const over = (top: { rgb: number[]; alpha: number }, below: number[]) =>
			top.rgb.map((c, i) => c * top.alpha + below[i] * (1 - top.alpha));
		const backgroundBehind = (el: Element) => {
			const layers: Element[] = [];
			for (let node: Element | null = el; node && node !== cardEl; node = node.parentElement)
				layers.unshift(node);
			return layers.reduce(
				(below, node) => over(channels(getComputedStyle(node).backgroundColor), below),
				cardBackground
			);
		};
		const ancestorOpacity = (el: Element) => {
			let alpha = 1;
			for (let node: Element | null = el; node && node !== cardEl; node = node.parentElement)
				alpha *= Number(getComputedStyle(node).opacity);
			return alpha;
		};
		const ratio = (a: number[], b: number[]) => {
			const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};
		const failures: string[] = [];
		for (const el of cardEl.querySelectorAll('*')) {
			const isIcon = el.matches('.highlight-star');
			const hasText = [...el.childNodes].some(
				(n) => n.nodeType === Node.TEXT_NODE && /[A-Za-z0-9]/.test(n.textContent ?? '')
			);
			if (!hasText && !isIcon) continue;
			const style = getComputedStyle(el);
			const color = channels(el instanceof SVGElement ? style.fill : style.color);
			const background = backgroundBehind(el);
			const text = over({ rgb: color.rgb, alpha: color.alpha * ancestorOpacity(el) }, background);
			const contrast = ratio(text, background);
			if (contrast < (isIcon ? 3 : 4.5))
				failures.push(`${(el.textContent ?? '').trim().slice(0, 20)} ${contrast.toFixed(2)}`);
		}
		return failures;
	});
}

test.describe('Export card layout', () => {
	for (const count of [6, 7, 10, 12]) {
		test(`highlights card fits ${count} favourites with two-line titles`, async ({ page }) => {
			await uploadCsv(
				page,
				garminCsv(favourites(count, (i) => `Morning tempo run along the river path no ${i}`))
			);
			await showSlide(page, 2);

			expect(await overflowingCardElements(page, '*')).toEqual([]);
		});
	}

	test('highlights card shows as many favourites as fit', async ({ page }) => {
		const types = ['Cycling', 'Pool Swimming', 'Hiking', 'Yoga', 'Strength Training', 'Running'];
		await uploadCsv(
			page,
			garminCsv(
				Array.from({ length: 12 }, (_, i) => ({
					title: `Fav ${i} Extremely long activity title that goes past sixty characters for sure`,
					type: types[i % types.length],
					favorite: true
				}))
			)
		);
		await page.locator('#userName').fill('bb-prod1 Ann');
		await showSlide(page, 2);
		await page.evaluate(() => document.fonts.ready);

		await expect(page.locator('#export-card .highlight-title')).toHaveCount(10);
		for (let i = 0; i < 10; i++)
			await expect(page.locator('#export-card .highlight-title').nth(i)).toContainText(`Fav ${i} `);
		await expect(page.locator('#export-card')).not.toContainText(/more highlights/);
		expect(await overflowingCardElements(page, '*')).toEqual([]);
	});

	test('highlights card uses the full layout when it fits', async ({ page }) => {
		await uploadCsv(
			page,
			garminCsv(
				favourites(6, (i) =>
					i === 0 ? 'Rotterdam Marathon - New Personal Best' : `Morning run ${i}`
				)
			)
		);
		await showSlide(page, 2);
		await page.evaluate(() => document.fonts.ready);

		await expect
			.poll(() =>
				page
					.locator('#export-card .highlight-title')
					.first()
					.evaluate((el) => getComputedStyle(el).fontSize)
			)
			.toBe('40px');
		expect(await overflowingCardElements(page, '*')).toEqual([]);
	});

	test('highlights card keeps a 300 character title inside the card', async ({ page }) => {
		await uploadCsv(
			page,
			garminCsv([
				{ title: 'A'.repeat(300), favorite: true },
				{ title: 'word '.repeat(60), favorite: true }
			])
		);
		await showSlide(page, 2);

		expect(await overflowingCardElements(page, '*')).toEqual([]);
		const titles = page.locator('#export-card .highlight-title');
		for (const title of await titles.all()) {
			const fits = await title.evaluate((el) => el.scrollWidth <= el.clientWidth);
			expect(fits).toBe(true);
		}
	});

	test('the name input stops at 40 characters', async ({ page }) => {
		await uploadCsv(page, garminCsv(favourites(3, (i) => `Run ${i}`)));

		await page.locator('#userName').pressSequentially('X'.repeat(50));

		await expect(page.locator('#userName')).toHaveValue('X'.repeat(40));
	});

	const longName = 'W'.repeat(40);
	const spacedName = 'Wolfgang Amadeus Mozart Bartholdy Wilhelmina'.slice(0, 40);
	const nameCases = [
		{ index: 0, card: 'summary', theme: 'neon', name: longName },
		{ index: 1, card: 'breakdown', theme: 'neon', name: longName },
		{ index: 2, card: 'highlights', theme: 'neon', name: longName },
		{ index: 0, card: 'summary', theme: 'classic', name: longName },
		{ index: 0, card: 'summary', theme: 'synthwave', name: longName },
		{ index: 0, card: 'summary', theme: 'lightmile', name: longName },
		{ index: 0, card: 'summary', theme: 'neon', name: spacedName },
		{ index: 0, card: 'summary', theme: 'classic', name: spacedName }
	];
	for (const { index, card, theme, name } of nameCases) {
		test(`${card} ${theme} card fits the ${name.length} character name ${name.slice(0, 8)}...`, async ({
			page
		}) => {
			await uploadCsv(
				page,
				garminCsv(favourites(6, (i) => `Morning tempo run along the river path no ${i}`))
			);
			await page.locator('#userName').fill(name);
			if (theme !== 'neon')
				await page.getByRole('button', { name: new RegExp(`^${theme}`, 'i') }).click();
			await showSlide(page, index);
			await expect(page.locator('#export-card')).toHaveAttribute('data-theme', theme);

			await page.evaluate(() => document.fonts.ready);
			await expect.poll(() => overflowingCardElements(page, '*')).toEqual([]);
			const lines = await page
				.locator('#export-card .export-name')
				.evaluate(
					(el: HTMLElement) => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight)
				);
			expect(lines).toBeLessThanOrEqual(2.05);
		});
	}

	for (const theme of ['classic', 'synthwave']) {
		test(`summary ${theme} card fits a short name`, async ({ page }) => {
			await uploadCsv(page, garminCsv([{ title: 'Run', distance: '10' }]));
			await page.locator('#userName').fill('Ana');
			await page.getByRole('button', { name: new RegExp(theme, 'i') }).click();
			await showSlide(page, 0);
			await expect(page.locator('#export-card')).toHaveAttribute('data-theme', theme);
			await page.evaluate(() => document.fonts.ready);
			await expect.poll(() => overflowingCardElements(page, '*')).toEqual([]);
		});
	}

	for (const [index, card] of CARDS.entries()) {
		test(`${card} card text is readable in the Minimal theme`, async ({ page }) => {
			await uploadCsv(page, garminCsv(favourites(3, (i) => `Run ${i}`)));
			await page.locator('#userName').fill('Ana');
			await page.getByRole('button', { name: /Minimal/i }).click();
			await showSlide(page, index);
			await expect(page.locator('#export-card')).toHaveAttribute('data-theme', 'minimalist');
			await expect.poll(() => lowContrastText(page)).toEqual([]);
		});
	}

	test('weekly bars stand out from the Minimal background', async ({ page }) => {
		await uploadCsv(page, garminCsv(favourites(3, (i) => `Run ${i}`)));
		await page.getByRole('button', { name: /Minimal/i }).click();
		await showSlide(page, 1);
		await expect(page.locator('#export-card')).toHaveAttribute('data-theme', 'minimalist');

		const ratios = await page.locator('#export-card .weekly-bar').evaluateAll((bars) => {
			const background = [250, 250, 249];
			const luminance = (rgb: number[]) => {
				const [r, g, b] = rgb.map((c) => {
					const s = c / 255;
					return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
				});
				return 0.2126 * r + 0.7152 * g + 0.0722 * b;
			};
			return bars
				.filter((bar) => (bar as HTMLElement).offsetHeight > 0)
				.map((bar) => {
					const style = getComputedStyle(bar);
					const alpha = Number(style.opacity);
					const [r, g, b] = (style.backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
					const rgb = [r, g, b].map((c, i) => c * alpha + background[i] * (1 - alpha));
					const [hi, lo] = [luminance(rgb), luminance(background)].sort((x, y) => y - x);
					return (hi + 0.05) / (lo + 0.05);
				});
		});
		expect(ratios.length).toBeGreaterThan(0);
		expect(Math.min(...ratios)).toBeGreaterThanOrEqual(3);
	});

	test('donut slices leave a visible gap between them', async ({ page }) => {
		await uploadCsv(
			page,
			garminCsv([
				{ title: 'Run' },
				{ title: 'Ride', type: 'Cycling' },
				{ title: 'Swim', type: 'Pool Swim', distance: '1.0' }
			])
		);
		await showSlide(page, 1);

		const caps = await page
			.locator('.donut-segment')
			.evaluateAll((els) => els.map((el) => getComputedStyle(el).strokeLinecap));
		expect(caps.length).toBeGreaterThan(1);
		expect(new Set(caps)).toEqual(new Set(['butt']));
	});

	test('record bibs keep values and rules level when one value shrinks to fit', async ({
		page
	}) => {
		const header = 'Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent';
		await uploadCsv(
			page,
			[
				header,
				`Running,${TARGET_YEAR}-03-01 08:00:00,false,"Marathon",42.6,4200,03:30:00,100`,
				`Hiking,${TARGET_YEAR}-03-02 08:00:00,false,"Mountain Hike",12.0,900,03:55:00,800`
			].join('\n')
		);
		await showSlide(page, 1);

		const card = page.locator('#export-card');
		await expect(card.getByTestId('record-value').last()).toHaveText('4,200kcal');
		const bottoms = (selector: string) =>
			card
				.locator(selector)
				.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().bottom)));
		expect(new Set(await bottoms('[data-testid="record-value"]')).size).toBe(1);
		expect(new Set(await bottoms('[data-testid="record-title"]')).size).toBe(1);
	});
});
