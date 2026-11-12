import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import { DASHBOARD_HEADING, downloadAllCards } from './helpers.js';

const EXPORT_SCALE = 1;
const GLOW_RADIUS = 218;

// WebKit used to draw the blurred avatar box-shadow as a hard block on one side only.
test('avatar glow in the exported summary is even on every side', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();

	const centre = await page
		.locator('#export-card .avatar-container')
		.evaluate((el: HTMLElement) => {
			const card = el.closest('#export-card') as HTMLElement;
			const cardBox = card.getBoundingClientRect();
			const box = el.getBoundingClientRect();
			const scale = cardBox.width / card.offsetWidth;
			return {
				x: (box.left - cardBox.left + box.width / 2) / scale,
				y: (box.top - cardBox.top + box.height / 2) / scale
			};
		});
	const [summary] = await downloadAllCards(page);
	const png = PNG.sync.read(summary);
	const brightness = (dx: number, dy: number) => {
		const x = Math.round((centre.x + dx) * EXPORT_SCALE);
		const y = Math.round((centre.y + dy) * EXPORT_SCALE);
		const i = (y * png.width + x) * 4;
		return png.data[i] + png.data[i + 1] + png.data[i + 2];
	};

	const sides = [
		brightness(-GLOW_RADIUS, 0),
		brightness(GLOW_RADIUS, 0),
		brightness(0, -GLOW_RADIUS),
		brightness(0, GLOW_RADIUS)
	];
	expect(Math.max(...sides) - Math.min(...sides)).toBeLessThan(60);
});
