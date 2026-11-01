import { test, expect } from '@playwright/test';
import { garminCsv, overflowingCardElements, showSlide, uploadCsv } from './helpers.js';

const CARDS = ['summary', 'breakdown', 'highlights'] as const;

const favourites = (count: number, title: (i: number) => string) =>
	Array.from({ length: count }, (_, i) => ({ title: title(i), favorite: true }));

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

	for (const name of [
		'W'.repeat(40),
		'Wolfgang Amadeus Mozart Bartholdy Wilhelmina'.slice(0, 40)
	]) {
		for (const [index, card] of CARDS.entries()) {
			test(`${card} card fits the ${name.length} character name ${name.slice(0, 8)}...`, async ({
				page
			}) => {
				await uploadCsv(
					page,
					garminCsv(favourites(6, (i) => `Morning tempo run along the river path no ${i}`))
				);
				await page.locator('#userName').fill(name);
				await showSlide(page, index);

				expect(await overflowingCardElements(page, '*')).toEqual([]);
				const lines = await page
					.locator('#export-card .export-name')
					.evaluate(
						(el: HTMLElement) => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight)
					);
				expect(lines).toBeLessThanOrEqual(2.05);
			});
		}
	}

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
});
