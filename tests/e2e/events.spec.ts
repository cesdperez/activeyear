import { test, expect, type Page } from '@playwright/test';
import { KOFI_URL } from '../../src/lib/constants/site.js';
import { DASHBOARD_HEADING, gotoUpload } from './helpers.js';

const scrollToRecords = (page: Page) =>
	page
		.getByRole('heading', { name: 'Personal records' })
		.evaluate((heading) => heading.scrollIntoView({ block: 'start' }));

test('event endpoint accepts only valid events', async ({ request, baseURL }) => {
	for (const [body, status] of [
		['{"event":"export","value":"neon"}', 204],
		['{"event":"unknown","value":"neon"}', 400],
		['{"event":"export","value":"bad"}', 400]
	] as const) {
		expect(
			(
				await request.post('/api/event', {
					data: body,
					headers: { 'content-type': 'text/plain', origin: baseURL! }
				})
			).status()
		).toBe(status);
	}
	expect((await request.get('/api/event')).ok()).toBe(false);
});

test('floating support link tracks its placement', async ({ page }) => {
	await page.addInitScript(() =>
		Object.defineProperty(navigator, 'webdriver', { get: () => false })
	);
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	const link = page.locator('a.fixed').filter({ hasText: 'Buy me a gel' });
	await expect(link).toBeHidden();
	await scrollToRecords(page);
	await expect(link).toBeVisible();
	const event = page.waitForRequest(
		(request) =>
			request.url().includes('/api/event') && request.postData()?.includes('floating') === true
	);
	await link.click();
	expect((await event).postData()).toContain('support_clicked');

	await page.locator('[data-support-placement="footer"] a').scrollIntoViewIfNeeded();
	await expect(link).toBeHidden();
	await scrollToRecords(page);
	await expect(link).toBeVisible();
});

test('floating support link stays on screen from the header to the footer on mobile', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	const link = page.locator('a.fixed').filter({ hasText: 'Buy me a gel' });
	await expect(link).toBeHidden();
	await scrollToRecords(page);
	await expect(link).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.style.scrollPaddingBottom)).toBe(
		'5rem'
	);
	for (const target of [
		page.getByRole('searchbox', { name: 'Add an activity' }),
		page.locator('#export-download')
	]) {
		await target.scrollIntoViewIfNeeded();
		await expect(link).toBeVisible();
	}
	await page.locator('[data-support-placement="footer"]').scrollIntoViewIfNeeded();
	await expect(link).toBeHidden();
});

test('focused controls leave the floating link clear on mobile', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	const link = page.locator('a.fixed').filter({ hasText: 'Buy me a gel' });
	for (const [control, content] of [
		[
			page.getByTestId('highlight-row').first().getByRole('button'),
			page.getByTestId('highlight-row').first().getByRole('button')
		],
		[page.locator('#export-download'), page.locator('.export-note')]
	] as const) {
		await control.evaluate((el) =>
			window.scrollTo(
				0,
				el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 50
			)
		);
		await expect(link).toBeVisible();
		await control.focus();
		await expect(link).toBeVisible();
		await expect
			.poll(async () => {
				const a = await link.boundingBox();
				const b = await content.boundingBox();
				return a && b ? b.y + b.height - a.y : Infinity;
			})
			.toBeLessThanOrEqual(0);
	}
});

test('support link text sits on the sentence baseline', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /demo data/i }).click();
	const footer = page.locator('[data-support-placement="footer"]');
	await footer.scrollIntoViewIfNeeded();
	const offset = await footer.evaluate((p) => {
		const textBottom = (text: string) => {
			const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
			while (walker.nextNode()) {
				if (!walker.currentNode.textContent!.includes(text)) continue;
				const range = document.createRange();
				range.selectNodeContents(walker.currentNode);
				return range.getBoundingClientRect().bottom;
			}
			throw new Error(`no text ${text}`);
		};
		return Math.abs(textBottom('Buy me a gel') - textBottom('Enjoying ActiveYear?'));
	});
	expect(offset).toBeLessThan(1);
});

test('FAQ support link tracks its placement', async ({ page }) => {
	await page.addInitScript(() =>
		Object.defineProperty(navigator, 'webdriver', { get: () => false })
	);
	await gotoUpload(page);
	const link = page.locator('#faq-heading').locator('..').getByRole('link', { name: /ko-fi/i });
	await expect(link).toHaveAttribute('href', KOFI_URL);
	const event = page.waitForRequest(
		(request) =>
			request.url().includes('/api/event') && request.postData()?.includes('faq') === true
	);
	await link.click();
	expect(JSON.parse((await event).postData()!)).toEqual({ event: 'support_clicked', value: 'faq' });
});
