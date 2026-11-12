import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import { downloadAllCards, uploadSample } from './helpers.js';

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
		await uploadSample(page);

		const downloadButton = page.getByRole('button', { name: /Download All Images/i });
		await expect(downloadButton).toBeEnabled();

		// Visual fidelity of downloads is tested in visual-export.spec.ts
		// Here we just verify the button triggers the export action
		const downloadPromise = page.waitForEvent('download');
		await downloadButton.click();

		expect((await downloadPromise).suggestedFilename()).toBe('activeyear-2026-summary.png');
	});

	test('downloads every card as a 1080x1920 PNG', async ({ page }) => {
		await uploadSample(page);

		for (const card of await downloadAllCards(page)) {
			const { width, height } = PNG.sync.read(card);
			expect({ width, height }).toEqual({ width: 1080, height: 1920 });
		}
	});

	test('theme selector is visible', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByRole('button', { name: /Neon/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Minimal/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Retro/i })).toBeVisible();
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
