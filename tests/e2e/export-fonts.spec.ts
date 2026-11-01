import { test, expect, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { DASHBOARD_HEADING, downloadAllCards } from './helpers.js';

const MAX_DIFF_RATIO = 0.005;

async function loadDemo(page: Page): Promise<void> {
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
}

function diffRatio(a: Buffer, b: Buffer): number {
	const [imgA, imgB] = [PNG.sync.read(a), PNG.sync.read(b)];
	const { width, height } = imgA;
	return (
		pixelmatch(imgA.data, imgB.data, null, width, height, { threshold: 0.2 }) / (width * height)
	);
}

test.describe('Export fonts', () => {
	test('cards exported offline use the same fonts as online', async ({
		page,
		context,
		browser,
		browserName
	}) => {
		test.skip(
			browserName !== 'chromium',
			'WebKit leaves one page face in error offline; the next test covers its export'
		);
		const online = await browser.newPage();
		await online.goto('/');
		await loadDemo(online);
		await online.evaluate(() => document.fonts.ready);
		const [reference] = await downloadAllCards(online);
		await online.close();

		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await context.setOffline(true);
		await loadDemo(page);
		const [offline] = await downloadAllCards(page);

		const faces = await page.evaluate(() =>
			[...document.fonts]
				.filter((f) => /Outfit|JetBrains Mono/.test(f.family))
				.map((f) => `${f.family} ${f.weight} ${f.unicodeRange.slice(0, 12)} ${f.status}`)
		);
		expect(faces.filter((f) => !f.endsWith('loaded'))).toEqual([]);
		expect(diffRatio(reference, offline)).toBeLessThan(MAX_DIFF_RATIO);
	});

	test('cards exported after font requests start failing keep their fonts', async ({
		page,
		browser
	}) => {
		const online = await browser.newPage();
		await online.goto('/');
		await loadDemo(online);
		await online.evaluate(() => document.fonts.ready);
		const [reference] = await downloadAllCards(online);
		await online.close();

		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.route(/\.woff2?$/, (route) => route.abort());
		await loadDemo(page);
		const [blocked] = await downloadAllCards(page);

		expect(diffRatio(reference, blocked)).toBeLessThan(MAX_DIFF_RATIO);
	});

	test('export reports fonts that cannot load instead of saving fallback text', async ({
		page
	}) => {
		await page.route(/\.woff2?$/, (route) => route.abort());
		await page.goto('/');
		await loadDemo(page);

		let downloaded = false;
		page.on('download', () => (downloaded = true));
		await page.getByRole('button', { name: /Download All Images/i }).click();

		await expect(page.getByText(/fonts/i)).toBeVisible();
		expect(downloaded).toBe(false);
	});
});
