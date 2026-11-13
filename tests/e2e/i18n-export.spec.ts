import { test, expect, type Download } from '@playwright/test';
import { readFileSync } from 'fs';
import { PNG } from 'pngjs';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { SAMPLE_CSV } from './helpers.js';

test('Spanish upload and export', async ({ page }) => {
	await page.goto('/es/');
	await page.locator('input[type="file"]').setInputFiles(SAMPLE_CSV);
	await expect(page.getByRole('heading', { name: `Tu ${TARGET_YEAR}` })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Exportar' })).toBeVisible();
	const card = page.locator('#export-card');
	await expect(card.getByText('AÑO DEPORTIVO')).toBeVisible();
	await expect(card).not.toContainText(/TOTAL DISTANCE|PERSONAL RECORDS|ACTIVE DAYS/i);

	const downloads: Download[] = [];
	page.on('download', (download) => downloads.push(download));
	await page.getByRole('button', { name: 'Descargar todas las imágenes' }).click();
	await expect.poll(() => downloads.length, { timeout: 15000 }).toBe(3);
	for (const download of downloads) {
		expect(download.suggestedFilename()).toMatch(/\.png$/);
		const image = PNG.sync.read(readFileSync((await download.path()) ?? ''));
		expect({ width: image.width, height: image.height }).toEqual({ width: 1080, height: 1920 });
	}
});
