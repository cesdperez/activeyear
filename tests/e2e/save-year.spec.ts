import { readFileSync } from 'fs';
import { test, expect, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { DASHBOARD_HEADING, STRAVA_CSV, gotoUpload, uploadSample } from './helpers.js';

async function downloadYear(page: Page): Promise<Buffer> {
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Save my year', exact: true }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe(`activeyear-${TARGET_YEAR}.json`);
	return readFileSync((await download.path())!);
}

async function uploadJson(page: Page, buffer: Buffer) {
	await page.locator('input[type="file"]').setInputFiles({
		name: 'saved.json',
		mimeType: 'application/json',
		buffer
	});
}

for (const source of ['Garmin', 'Strava']) {
	test(`${source} year can be saved and reopened`, async ({ page }) => {
		if (source === 'Garmin') {
			await uploadSample(page);
		} else {
			await gotoUpload(page);
			await page.locator('input[type="file"]').setInputFiles(STRAVA_CSV);
			await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
		}
		const stats = page.getByTestId('main-stats');
		const summary = page.getByTestId('activity-summary');
		const statsText = await stats.innerText();
		const summaryText = await summary.innerText();
		const json = await downloadYear(page);

		await gotoUpload(page);
		await uploadJson(page, json);
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
		await expect(stats).toHaveText(statsText, { useInnerText: true });
		await expect(summary).toHaveText(summaryText, { useInnerText: true });
	});
}

test('rejects a saved year from another year', async ({ page }) => {
	await uploadSample(page);
	const json = JSON.parse((await downloadYear(page)).toString());
	json.year = TARGET_YEAR - 1;
	await gotoUpload(page);
	await uploadJson(page, Buffer.from(JSON.stringify(json)));
	await expect(page.getByRole('alert')).toContainText(String(TARGET_YEAR - 1));
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).not.toBeVisible();
});

test('rejects JSON that is not a saved year', async ({ page }) => {
	await gotoUpload(page);
	await uploadJson(page, Buffer.from('{}'));
	await expect(page.getByRole('alert')).not.toBeEmpty();
	await expect(page.getByText('Click to try again')).toBeVisible();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).not.toBeVisible();
});
