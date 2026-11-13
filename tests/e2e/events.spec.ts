import { test, expect } from '@playwright/test';
import { KOFI_URL } from '../../src/lib/constants/site.js';
import { DASHBOARD_HEADING, gotoUpload } from './helpers.js';

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
	await page.evaluate(() => window.scrollTo(0, 1000));
	await expect(link).toBeVisible();
	const event = page.waitForRequest(
		(request) =>
			request.url().includes('/api/event') && request.postData()?.includes('floating') === true
	);
	await link.click();
	expect((await event).postData()).toContain('support_clicked');

	await page.locator('[data-support-placement="footer"] a').scrollIntoViewIfNeeded();
	await expect(link).toBeHidden();
	await page.evaluate(() => window.scrollTo(0, 1000));
	await expect(link).toBeVisible();
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
