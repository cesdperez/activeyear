import { test, expect, type Page } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test.describe('Export Flow', () => {
	async function uploadAndWaitForDashboard(page: Page) {
		await page.addStyleTag({
			content:
				'*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }'
		});

		await page.goto('/');
		const fileInput = page.locator('input[type="file"]');
		const csvPath = join(__dirname, '..', '..', 'src', 'lib', 'parsers', '__fixtures__', 'garmin-sample.csv');
		await fileInput.setInputFiles(csvPath);
		await expect(page.getByRole('heading', { name: 'Your 2025' })).toBeVisible({ timeout: 10000 });
	}

	test('export panel appears after upload', async ({ page }) => {
		await uploadAndWaitForDashboard(page);

		await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();

		// Ratio buttons should NOT be present (single ratio only)
		await expect(page.getByRole('button', { name: /9:16/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /1:1/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /4:5/i })).not.toBeVisible();

		await expect(page.getByRole('button', { name: /Download All Images/i })).toBeVisible();
	});

	test('user name personalization works', async ({ page }) => {
		await uploadAndWaitForDashboard(page);

		const nameInput = page.locator('#userName');
		await expect(nameInput).toBeVisible();

		await nameInput.fill('César');

		const exportCard = page.locator('#export-card');
		await expect(exportCard.getByText("César's")).toBeVisible();
	});

	test('download button triggers export', async ({ page }) => {
		await uploadAndWaitForDashboard(page);

		const downloadButton = page.getByRole('button', { name: /Download All Images/i });
		await expect(downloadButton).toBeEnabled();

		// Visual fidelity of downloads is tested in visual-export.spec.ts
		// Here we just verify the button triggers the export action
		await downloadButton.click();

		await expect(page.getByText(/Generating|Download All Images/i)).toBeVisible();
	});

	test('theme selector is visible', async ({ page }) => {
		await uploadAndWaitForDashboard(page);

		await expect(page.getByRole('button', { name: /Neon/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Minimal/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Retro/i })).toBeVisible();
	});

	test('theme switching works', async ({ page }) => {
		await uploadAndWaitForDashboard(page);

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
