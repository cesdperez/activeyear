import { test, expect } from '@playwright/test';
import { recordCspViolations, uploadSample } from './helpers.js';

const BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js';
const RUM_URL = 'https://cloudflareinsights.com/cdn-cgi/rum';

test.describe('Content Security Policy', () => {
	test('prerendered page is served with the security headers', async ({ page }) => {
		const response = await page.goto('/');
		const headers = response!.headers();

		expect(headers['strict-transport-security']).toContain('max-age=31536000');
		expect(headers['x-frame-options']).toBe('SAMEORIGIN');
		expect(headers['x-content-type-options']).toBe('nosniff');
		const scriptSrc = headers['content-security-policy'].match(/script-src ([^;]*)/)![1];
		expect(scriptSrc).toMatch(/'sha256-/);
		expect(scriptSrc).not.toContain('unsafe');
	});

	test('unknown paths get the security headers too', async ({ page }) => {
		const violations = recordCspViolations(page);
		const response = await page.goto('/no-such-page');

		expect(response!.status()).toBe(404);
		expect(response!.headers()['content-security-policy']).toContain("default-src 'self'");
		await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Back to ActiveYear' })).toHaveAttribute(
			'href',
			'/'
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
		expect(violations).toEqual([]);
	});

	test('nested unknown paths still load the stylesheet', async ({ page }) => {
		const response = await page.goto('/a/b/c');

		expect(response!.status()).toBe(404);
		const heading = page.getByRole('heading', { name: 'Page not found' });
		await expect(heading).toBeVisible();
		await expect
			.poll(() => heading.evaluate((el) => getComputedStyle(el).fontFamily))
			.toContain('Big Shoulders Display');
	});

	test('upload, confetti and PNG export run without violations', async ({ page }) => {
		const violations = recordCspViolations(page);
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await uploadSample(page);
		await page.getByRole('button', { name: 'Celebration confetti' }).click();

		const downloads: string[] = [];
		page.on('download', (download) => downloads.push(download.suggestedFilename()));
		await page.getByRole('button', { name: /Download All Images/i }).click();
		await expect.poll(() => downloads.length, { timeout: 15000 }).toBe(3);

		expect(violations).toEqual([]);
	});

	test('Cloudflare Insights beacon loads and reports', async ({ page }) => {
		await page.route(BEACON_URL, (route) =>
			route.fulfill({
				contentType: 'application/javascript',
				body: `fetch('${RUM_URL}', { method: 'POST', body: '{}' });`
			})
		);
		await page.route(RUM_URL, (route) => route.fulfill({ status: 204 }));
		const violations = recordCspViolations(page);
		const reported = page.waitForRequest(RUM_URL);

		await page.goto('/');
		// Cloudflare injects this tag at the edge, so it never appears in the built HTML.
		await page.evaluate((src) => {
			const script = document.createElement('script');
			script.src = src;
			document.head.append(script);
		}, BEACON_URL);

		await reported;
		expect(violations).toEqual([]);
	});
});
