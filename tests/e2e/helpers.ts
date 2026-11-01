import { expect, type Page } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';

export const SAMPLE_CSV = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'..',
	'src',
	'lib',
	'parsers',
	'__fixtures__',
	'garmin-sample.csv'
);

export const DASHBOARD_HEADING = `Your ${TARGET_YEAR}`;

export async function uploadSample(page: Page): Promise<void> {
	await page.goto('/');
	await page.locator('input[type="file"]').setInputFiles(SAMPLE_CSV);
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible({
		timeout: 10000
	});
}
