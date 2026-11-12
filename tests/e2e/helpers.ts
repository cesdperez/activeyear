import { expect, type Download, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
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

export interface CsvActivity {
	title: string;
	favorite?: boolean;
	type?: string;
	distance?: string;
}

export function garminCsv(activities: CsvActivity[]): string {
	const rows = activities.map(
		({ title, favorite = false, type = 'Running', distance = '10.0' }, i) =>
			`${type},${TARGET_YEAR}-03-${String(i + 1).padStart(2, '0')} 08:00:00,${favorite},"${title}",${distance},600,00:50:00,100`
	);
	return ['Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent', ...rows].join(
		'\n'
	);
}

export async function uploadCsv(page: Page, csv: string): Promise<void> {
	await page.goto('/');
	await page
		.locator('input[type="file"]')
		.setInputFiles({ name: 'activities.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible({
		timeout: 10000
	});
}

/** Clicks Download All Images and returns the three PNGs in card order. */
export async function downloadAllCards(page: Page): Promise<Buffer[]> {
	const downloads: Download[] = [];
	const collect = (download: Download) => downloads.push(download);
	page.on('download', collect);
	await page.getByRole('button', { name: /Download All Images/i }).click();
	await expect.poll(() => downloads.length, { timeout: 15000 }).toBe(3);
	page.off('download', collect);
	return Promise.all(downloads.map(async (d) => readFileSync((await d.path()) ?? '')));
}

export async function showSlide(page: Page, slideIndex: number): Promise<void> {
	await page.locator('.carousel-dots .dot').nth(slideIndex).click();
}

/** Elements matching `selector` inside the export card whose box sticks out of the card. */
export async function overflowingCardElements(page: Page, selector: string): Promise<string[]> {
	return page.locator('#export-card').evaluate((card, sel) => {
		const bounds = card.getBoundingClientRect();
		const outside = (r: DOMRect) =>
			r.left < bounds.left - 0.5 ||
			r.right > bounds.right + 0.5 ||
			r.top < bounds.top - 0.5 ||
			r.bottom > bounds.bottom + 0.5;
		return [...card.querySelectorAll(sel)]
			.filter((el) => outside(el.getBoundingClientRect()))
			.map((el) => (el.textContent ?? '').trim().slice(0, 40));
	}, selector);
}

// Chrome reports violations from every frame on the console, including modern-screenshot's sandbox iframe.
export function recordCspViolations(page: Page): string[] {
	const violations: string[] = [];
	page.on('console', (message) => {
		if (message.text().includes('Content Security Policy')) violations.push(message.text());
	});
	return violations;
}
