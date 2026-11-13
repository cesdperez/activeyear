import { test, expect, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { recordCspViolations } from './helpers.js';

const SITE_URL = 'https://activeyear.app';

async function jsonLdBlocks(page: Page): Promise<Record<string, unknown>[]> {
	const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
	return blocks.map((block) => JSON.parse(block));
}

test.describe('Search and AI discovery', () => {
	test('home page head describes the app for search and social previews', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveTitle(new RegExp(`Garmin & Strava Year in Review ${TARGET_YEAR}`));
		const head = page.locator('head');
		await expect(head.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			new RegExp(`${TARGET_YEAR} year in review`)
		);
		await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/`);
		await expect(head.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${SITE_URL}/og-image.png`
		);
		await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		);
	});

	test('German page has localized metadata and language alternates', async ({ page }) => {
		await page.goto('/de/');
		await expect(page).toHaveTitle(/Jahresrückblick/);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/de/`);
		for (const locale of ['en', 'es', 'pt', 'fr', 'de', 'nl', 'x-default']) {
			const path = locale === 'en' || locale === 'x-default' ? '/' : `/${locale}/`;
			await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`)).toHaveAttribute(
				'href',
				`${SITE_URL}${path}`
			);
		}
	});

	test('prerendered pages declare their language', async ({ request }) => {
		for (const [path, lang] of [
			['/', 'en'],
			['/de/', 'de']
		]) {
			const response = await request.get(path);
			expect(response.status()).toBe(200);
			expect(await response.text()).toMatch(new RegExp(`<html\\s+lang="${lang}"`));
		}
	});

	test('unknown paths under a locale get that locale’s 404 page', async ({ page }) => {
		const response = await page.goto('/de/gibtsnicht');

		expect(response!.status()).toBe(404);
		expect(await response!.text()).toMatch(/<html\s+lang="de"/);
		await expect(page).toHaveTitle('Seite nicht gefunden · ActiveYear');
		await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Zurück zu ActiveYear' })).toHaveAttribute(
			'href',
			'/de/'
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('apple touch icon is available as a PNG', async ({ page, request }) => {
		await page.goto('/');

		await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
			'href',
			/\/apple-touch-icon\.png$/
		);
		const response = await request.get('/apple-touch-icon.png');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('image/png');
	});

	test('structured data parses and its FAQ matches the visible FAQ', async ({ page }) => {
		const cspViolations = recordCspViolations(page);
		await page.goto('/');

		const blocks = await jsonLdBlocks(page);
		expect(blocks.map((block) => block['@type'])).toEqual(['WebApplication', 'FAQPage']);
		const faq = blocks[1].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
		for (const { name, acceptedAnswer } of faq) {
			await expect(page.getByText(name, { exact: true })).toBeVisible();
			const answer = page.locator('dt', { hasText: name }).locator('..').locator('dd');
			await expect(answer).toBeVisible();
			const text = await answer.evaluate((element) => {
				const copy = element.cloneNode(true) as HTMLElement;
				copy.querySelectorAll('.sr-only').forEach((hidden) => hidden.remove());
				return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
			});
			expect(text).toBe(acceptedAnswer.text.replace(/\s+/g, ' ').trim());
		}
		expect(cspViolations).toEqual([]);
	});

	test('robots.txt allows AI crawlers and points to the sitemap', async ({ request }) => {
		const response = await request.get('/robots.txt');

		expect(response.headers()['content-type']).toContain('text/plain');
		const body = await response.text();
		expect(body).toContain('User-agent: GPTBot\nAllow: /');
		expect(body).toContain('User-agent: ClaudeBot\nAllow: /');
		expect(body).not.toMatch(/Disallow: \//);
		expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
	});

	test('sitemap.xml lists the canonical home page', async ({ request }) => {
		const response = await request.get('/sitemap.xml');

		expect(response.headers()['content-type']).toContain('xml');
		const body = await response.text();
		for (const locale of ['en', 'es', 'pt', 'fr', 'de', 'nl']) {
			const path = locale === 'en' ? '/' : `/${locale}/`;
			expect(body).toContain(`<loc>${SITE_URL}${path}</loc>`);
		}
	});

	test('llms.txt describes the app for language models', async ({ request, page }) => {
		await page.goto('/');
		const englishDescription = await page
			.locator('meta[name="description"]')
			.getAttribute('content');
		await page.goto('/de/');
		const germanDescription = await page
			.locator('meta[name="description"]')
			.getAttribute('content');
		const response = await request.get('/llms.txt');

		expect(response.headers()['content-type']).toContain('text/plain');
		const body = await response.text();
		expect(body).toContain(englishDescription);
		const german = await request.get('/de/llms.txt');
		expect(german.status()).toBe(200);
		expect(german.headers()['content-type']).toContain('text/plain');
		expect(await german.text()).toContain(germanDescription);
		expect(body).toMatch(/^# ActiveYear\n\n> /);
		expect(body).toContain(`${TARGET_YEAR} activities`);
		expect(body).toContain('never uploaded');
		expect(body).toContain('Download or Delete Your Account');
		expect(body).toContain('Upload only activities.csv.');
	});
});
