import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import { DASHBOARD_HEADING, downloadAllCards } from './helpers.js';

const SHADOW_INSET = 4;

// WebKit draws shadow offsets upside down inside an SVG foreignObject, so this runs in both engines.
test('the Retro avatar shadow falls below the box in the exported card', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	await page.getByRole('button', { name: /Retro/i }).click();
	await expect(page.locator('#export-card')).toHaveAttribute('data-theme', 'retro');

	// Measured after the download, once the theme switch has settled.
	const [summary] = await downloadAllCards(page);
	const box = await page.locator('#export-card').evaluate((card: HTMLElement) => {
		const cardRect = card.getBoundingClientRect();
		const scale = cardRect.width / card.offsetWidth;
		const rect = card.querySelector('.avatar-container')!.getBoundingClientRect();
		return {
			centerX: Math.round((rect.left + rect.width / 2 - cardRect.left) / scale),
			top: Math.round((rect.top - cardRect.top) / scale),
			bottom: Math.round((rect.bottom - cardRect.top) / scale)
		};
	});

	const png = PNG.sync.read(summary);
	const brightnessAt = (x: number, y: number) => {
		const i = (y * png.width + x) * 4;
		return png.data[i] + png.data[i + 1] + png.data[i + 2];
	};

	expect(brightnessAt(box.centerX, box.bottom + SHADOW_INSET)).toBeLessThan(30);
	expect(brightnessAt(box.centerX, box.top - SHADOW_INSET)).toBeGreaterThan(30);
});
