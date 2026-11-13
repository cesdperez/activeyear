import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import { downloadAllCards, uploadSample } from './helpers.js';

const MAX_CARD_BYTES = 2 * 1024 * 1024;

test.describe('Export Flow', () => {
	test('export panel appears after upload', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();

		// Ratio buttons should NOT be present (single ratio only)
		await expect(page.getByRole('button', { name: /9:16/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /1:1/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /4:5/i })).not.toBeVisible();

		await expect(page.getByRole('button', { name: /Download All Images/i })).toBeVisible();
	});

	test('user name personalization works', async ({ page }) => {
		await uploadSample(page);

		const nameInput = page.locator('#userName');
		await expect(nameInput).toBeVisible();

		await nameInput.fill('César');

		const exportCard = page.locator('#export-card');
		await expect(exportCard.getByText("César's")).toBeVisible();
	});

	test('download button triggers export', async ({ page }) => {
		const events: string[] = [];
		page.on('request', (request) => {
			if (new URL(request.url()).pathname === '/api/event') events.push(request.url());
		});
		await uploadSample(page);
		await page.getByRole('button', { name: /Minimal/i }).click();
		await page.getByRole('button', { name: 'More stats' }).click();

		const downloadButton = page.getByRole('button', { name: /Download All Images/i });
		await expect(downloadButton).toBeEnabled();

		// Visual fidelity of downloads is tested in visual-export.spec.ts
		// Here we just verify the button triggers the export action
		const downloadPromise = page.waitForEvent('download');
		await downloadButton.click();

		expect((await downloadPromise).suggestedFilename()).toBe('activeyear-2026-summary.png');
		await expect(page.locator('#export-status')).toHaveText('Downloaded three images');
		expect(events).toEqual([]);
	});

	test('downloads every card as a 1080x1920 PNG under 2 MB', async ({ page }) => {
		await uploadSample(page);

		for (const card of await downloadAllCards(page)) {
			const { width, height } = PNG.sync.read(card);
			expect({ width, height }).toEqual({ width: 1080, height: 1920 });
			expect(card.length).toBeLessThan(MAX_CARD_BYTES);
		}
	});

	test('theme selector is visible', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByRole('button', { name: /Neon/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Minimal/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Retro/i })).toBeVisible();
		const lightmile = page.getByRole('button', { name: /Lightmile.*Coming soon/i });
		await expect(lightmile).toBeVisible();
		await expect(lightmile).toBeDisabled();
	});

	test('classic centers the summary avatar and neon restores it to the header', async ({
		page
	}) => {
		await uploadSample(page);
		const card = page.locator('#export-card');
		await page.getByRole('button', { name: /Classic/i }).click();
		await expect(card).toHaveAttribute('data-theme', 'classic');
		await expect(card.locator('.centered-avatar .avatar-container')).toHaveCount(1);
		await expect(card.locator('header .avatar-container')).toHaveCount(0);
		await page.getByRole('button', { name: /Neon/i }).click();
		await expect(card).toHaveAttribute('data-theme', 'neon');
		await expect(card.locator('.centered-avatar .avatar-container')).toHaveCount(0);
		await expect(card.locator('header .avatar-container')).toHaveCount(1);
	});

	test('theme switching works', async ({ page }) => {
		await uploadSample(page);

		const exportCard = page.locator('#export-card');

		await expect(exportCard).toHaveAttribute('data-theme', 'neon');

		await page.getByRole('button', { name: /Minimal/i }).click();
		await expect(exportCard).toHaveAttribute('data-theme', 'minimalist');

		await page.getByRole('button', { name: /Retro/i }).click();
		await expect(exportCard).toHaveAttribute('data-theme', 'retro');

		await page.getByRole('button', { name: /Neon/i }).click();
		await expect(exportCard).toHaveAttribute('data-theme', 'neon');
	});
});
