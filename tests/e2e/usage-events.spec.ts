import { test, expect } from '@playwright/test';
import { gotoUpload, uploadSample } from './helpers.js';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
	});
});

test('records usage events in order', async ({ page }) => {
	const payloads: string[] = [];
	await page.route('**/api/event', async (route) => {
		payloads.push(route.request().postData() ?? '');
		await route.fulfill({ status: 204 });
	});

	await uploadSample(page);
	await page.getByRole('button', { name: /Minimal/i }).click();
	await page.getByRole('button', { name: 'More stats' }).click();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: /Download All Images/i }).click();
	await download;

	await expect
		.poll(() => payloads.map((payload) => JSON.parse(payload)), { timeout: 15000 })
		.toEqual([
			{ event: 'upload_success', value: '1-10' },
			{ event: 'sports_count', value: '6+' },
			{ event: 'theme_selected', value: 'minimalist' },
			{ event: 'more_stats_opened', value: '' },
			{ event: 'export', value: 'minimalist' }
		]);
	for (const payload of payloads) {
		expect(Object.keys(JSON.parse(payload)).sort()).toEqual(['event', 'value']);
	}
});

test('records upload errors', async ({ page }) => {
	const payloads: string[] = [];
	await page.route('**/api/event', async (route) => {
		payloads.push(route.request().postData() ?? '');
		await route.fulfill({ status: 204 });
	});

	await gotoUpload(page);
	await page.locator('input[type="file"]').setInputFiles({
		name: 'notes.txt',
		mimeType: 'text/plain',
		buffer: Buffer.from('notes')
	});
	await expect
		.poll(() => payloads.map((payload) => JSON.parse(payload)))
		.toEqual([{ event: 'upload_error', value: 'unsupported-file-type' }]);
});
