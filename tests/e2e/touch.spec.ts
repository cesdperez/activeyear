import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { gotoUpload, uploadSample } from './helpers.js';

const ACCENT = 'rgb(72, 216, 228)';

const background = (locator: Locator) =>
	locator.evaluate((el) => getComputedStyle(el).backgroundColor);

async function presetAndSearchHeights(page: Page): Promise<number[]> {
	await uploadSample(page);
	const presets = page.getByRole('group', { name: 'Highlight presets' });
	return [
		await presets.evaluate((el) => el.getBoundingClientRect().height),
		await page.locator('#highlight-search').evaluate((el) => el.getBoundingClientRect().height)
	];
}

test('preset buttons and the highlight search share one height', async ({ page }) => {
	const [presets, search] = await presetAndSearchHeights(page);
	expect(presets).toBe(search);
});

test('a pressed segmented button keeps its accent fill while hovered', async ({ page }) => {
	await uploadSample(page);
	const km = page.getByRole('group', { name: 'Distance unit' }).getByRole('button', { name: 'km' });
	await expect(km).toHaveAttribute('aria-pressed', 'true');
	await km.hover();
	await expect.poll(() => background(km)).toBe(ACCENT);
});

test('text fields have an edge with 3:1 contrast against the page', async ({ page }) => {
	await uploadSample(page);
	for (const field of [page.locator('#userName'), page.locator('#highlight-search')]) {
		const color = await field.evaluate((el) => getComputedStyle(el).borderTopColor);
		expect(color).toBe('rgb(96, 113, 122)');
	}
});

test('reduced motion stops looping and delayed animations', async ({ page }) => {
	await uploadSample(page);
	const timing = await page.evaluate(() => {
		const el = document.createElement('div');
		el.className = 'animate-spin';
		el.style.animationDelay = '600ms';
		document.body.append(el);
		const style = getComputedStyle(el);
		return [style.animationIterationCount, style.animationDelay];
	});
	expect(timing).toEqual(['1', '0s']);
});

test.describe('on a touch screen', () => {
	const { viewport, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];
	test.use({ viewport, deviceScaleFactor, isMobile, hasTouch });

	test('hovering the Download button leaves it filled with the accent', async ({ page }) => {
		await uploadSample(page);
		const download = page.locator('#export-download');
		await download.hover();
		await expect.poll(() => background(download)).toBe(ACCENT);
	});

	test('export and segmented controls are at least 44px tall', async ({ page }) => {
		await uploadSample(page);
		await page.getByRole('button', { name: /Lightmile Paper/ }).click();
		await page.locator('#userAvatar').setInputFiles({
			name: 'avatar.png',
			mimeType: 'image/png',
			buffer: Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
				'base64'
			)
		});
		await expect(page.getByRole('button', { name: 'Remove image' })).toBeVisible();
		const controls = page.locator(
			'#export-panel button, .segmented > button, [aria-labelledby="summary-metric-label"] button'
		);
		const small = await controls.evaluateAll((elements) =>
			elements
				.map((el) => ({ el, rect: el.getBoundingClientRect() }))
				.filter(({ rect }) => rect.width > 0 && (rect.height < 44 || rect.width < 44))
				.map(
					({ el, rect }) =>
						`${el.getAttribute('aria-label') ?? el.textContent?.trim()} ${rect.width}x${rect.height}`
				)
		);
		expect(small).toEqual([]);
	});

	test.describe('on a tablet in landscape', () => {
		test.use({ viewport: { width: 1280, height: 800 } });

		test('the landing page shows the phone export hint and a full-width demo button', async ({
			page
		}) => {
			await gotoUpload(page);
			await expect(page.getByText('Export on a computer, or try the demo.')).toBeVisible();
			const demo = page.getByRole('button', {
				name: 'No CSV file? See how it works with demo data'
			});
			await expect(demo).toHaveCount(1);
			const box = await demo.boundingBox();
			expect(box!.height).toBeGreaterThanOrEqual(44);
			expect(box!.width).toBeGreaterThan(500);
		});

		test('preset buttons and the highlight search share one height', async ({ page }) => {
			const [presets, search] = await presetAndSearchHeights(page);
			expect(presets).toBe(search);
		});
	});
});
