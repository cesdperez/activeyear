import { test, expect, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';

const SITE_URL = 'https://activeyear.app';

async function jsonLdBlocks(page: Page): Promise<Record<string, unknown>[]> {
	const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
	return blocks.map((block) => JSON.parse(block));
}

test.describe('Search and AI discovery', () => {
	test('home page head describes the app for search and social previews', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveTitle(new RegExp(`Garmin Year in Review ${TARGET_YEAR}`));
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

	test('structured data parses and its FAQ matches the visible FAQ', async ({ page }) => {
		const cspViolations: string[] = [];
		page.on('console', (message) => {
			if (message.text().includes('Content Security Policy')) cspViolations.push(message.text());
		});
		await page.goto('/');

		const blocks = await jsonLdBlocks(page);
		expect(blocks.map((block) => block['@type'])).toEqual(['WebApplication', 'FAQPage']);
		const faq = blocks[1].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
		for (const { name, acceptedAnswer } of faq) {
			await expect(page.getByText(name, { exact: true })).toBeVisible();
			await expect(page.getByText(acceptedAnswer.text, { exact: true })).toBeVisible();
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
		expect(await response.text()).toContain(`<loc>${SITE_URL}/</loc>`);
	});

	test('llms.txt describes the app for language models', async ({ request }) => {
		const response = await request.get('/llms.txt');

		expect(response.headers()['content-type']).toContain('text/plain');
		const body = await response.text();
		expect(body).toMatch(/^# ActiveYear\n\n> /);
		expect(body).toContain(`${TARGET_YEAR} activities`);
		expect(body).toContain('never uploaded');
	});
});
