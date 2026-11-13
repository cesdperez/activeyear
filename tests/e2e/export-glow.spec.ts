import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import { DASHBOARD_HEADING, downloadAllCards } from './helpers.js';

const SAMPLE_STEP = 100;
const SAMPLE_COLUMN = 20;
// The noise tile at 3% opacity moves a pixel by a few levels either way.
const NOISE_TOLERANCE = 12;
const MAX_STEP = 40;

// The cyan glow is an image over the card, so it must fade without hard edges, from the top-left.
test('the Neon glow fades smoothly from the top-left corner', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

	const [summary] = await downloadAllCards(page);
	const png = PNG.sync.read(summary);
	const brightnessAt = (x: number, y: number) => {
		const i = (y * png.width + x) * 4;
		return png.data[i] + png.data[i + 1] + png.data[i + 2];
	};
	const column = Array.from({ length: Math.floor(png.height / SAMPLE_STEP) }, (_, i) =>
		brightnessAt(SAMPLE_COLUMN, i * SAMPLE_STEP)
	);

	expect(column[0] - column.at(-1)!).toBeGreaterThan(30);
	for (let i = 1; i < column.length; i++) {
		expect(column[i] - column[i - 1]).toBeLessThan(NOISE_TOLERANCE);
		expect(column[i - 1] - column[i]).toBeLessThan(MAX_STEP);
	}
	expect(brightnessAt(SAMPLE_COLUMN, 0)).toBeGreaterThan(
		brightnessAt(png.width - SAMPLE_COLUMN, 0)
	);
});
