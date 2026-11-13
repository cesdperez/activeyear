import { test, expect } from '@playwright/test';

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
	await page.evaluate(() => window.scrollTo(0, 1000));
	const link = page.locator('a.fixed').filter({ hasText: 'Buy me a gel' });
	await expect(link).toBeVisible();
	const event = page.waitForRequest(
		(request) =>
			request.url().includes('/api/event') && request.postData()?.includes('floating') === true
	);
	await link.click();
	expect((await event).postData()).toContain('support_clicked');
});
