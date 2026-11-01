import { test, expect, type Page } from '@playwright/test';
import { garminCsv, overflowingCardElements, showSlide, uploadCsv } from './helpers.js';

const CARDS = ['summary', 'breakdown', 'highlights'] as const;

const favourites = (count: number, title: (i: number) => string) =>
	Array.from({ length: count }, (_, i) => ({ title: title(i), favorite: true }));

/** Text and icons in the export card that fall below WCAG contrast on the Minimal background. */
function lowContrastText(page: Page): Promise<string[]> {
	return page.locator('#export-card').evaluate((cardEl) => {
		const background = [253, 253, 253];
		const luminance = (rgb: number[]) => {
			const [r, g, b] = rgb.map((c) => {
				const s = c / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			});
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const blended = (color: string, el: Element) => {
			const [r, g, b, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
			let alpha = a;
			for (let node: Element | null = el; node && node !== cardEl; node = node.parentElement)
				alpha *= Number(getComputedStyle(node).opacity);
			return [r, g, b].map((c, i) => c * alpha + background[i] * (1 - alpha));
		};
		const ratio = (rgb: number[]) => {
			const [hi, lo] = [luminance(rgb), luminance(background)].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};
		const failures: string[] = [];
		for (const el of cardEl.querySelectorAll('*')) {
			const isIcon = el.matches('.record-icon-compact, .highlight-star');
			const hasText = [...el.childNodes].some(
				(n) => n.nodeType === Node.TEXT_NODE && /[A-Za-z0-9]/.test(n.textContent ?? '')
			);
			if (!hasText && !isIcon) continue;
			const style = getComputedStyle(el);
			const color = el instanceof SVGElement ? style.fill : style.color;
			const contrast = ratio(blended(color, el));
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
