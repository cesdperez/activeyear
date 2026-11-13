import { test, expect } from '@playwright/test';
import { uploadSample } from './helpers.js';

test.use({ viewport: { width: 390, height: 844 } });

test('hover disclosure overlays no theme options', async ({ page }) => {
	await uploadSample(page);
	const options = page.locator('[aria-labelledby="theme-label"] button.toggle');
	const help = page.getByRole('button', { name: 'About Lightmile' });
	await help.scrollIntoViewIfNeeded();
	const boxes = await options.evaluateAll((elements) =>
		elements.map((el) => {
			const r = el.getBoundingClientRect();
			return [r.x, r.y, r.width, r.height];
		})
	);
	await help.hover();
	await expect(help).toHaveAttribute('aria-expanded', 'true');
	const link = page.getByRole('link', { name: 'lightmile.nl' });
	await expect(link).toHaveAttribute('href', 'https://lightmile.nl');
	const panel = page.locator('#lightmile-info');
	await expect(panel).toBeVisible();
	await expect
		.poll(() =>
			options.evaluateAll((elements) =>
				elements.map((el) => {
					const r = el.getBoundingClientRect();
					return [r.x, r.y, r.width, r.height];
				})
			)
		)
		.toEqual(boxes);
	const rect = await panel.boundingBox();
	expect(rect).not.toBeNull();
	expect(rect!.x).toBeGreaterThanOrEqual(0);
	expect(rect!.x + rect!.width).toBeLessThanOrEqual(390);
	for (const [x, y, width, height] of boxes)
		expect(
			rect!.x < x + width &&
				rect!.x + rect!.width > x &&
				rect!.y < y + height &&
				rect!.y + rect!.height > y
		).toBe(false);
	await expect(
		page.locator('#export-card').getByRole('button', { name: 'About Lightmile' })
	).toHaveCount(0);
});

test('keyboard opens, reaches link and escape returns focus', async ({ page }) => {
	await uploadSample(page);
	const help = page.getByRole('button', { name: 'About Lightmile' });
	await page.getByRole('button', { name: /Lightmile Paper/ }).focus();
	await page.keyboard.press('Tab');
	await expect(help).toBeFocused();
	await expect(help).toHaveAttribute('aria-expanded', 'true');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'lightmile.nl' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(help).toBeFocused();
	await expect(help).toHaveAttribute('aria-expanded', 'false');
});

test('escape dismisses hover disclosure without moving outside focus', async ({ page }) => {
	await uploadSample(page);
	const name = page.locator('#userName');
	const help = page.getByRole('button', { name: 'About Lightmile' });
	await name.focus();
	await help.hover();
	await expect(page.locator('#lightmile-info')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('#lightmile-info')).toBeHidden();
	await expect(name).toBeFocused();
});

test('focus leaving keeps the hovered panel open', async ({ page }) => {
	await uploadSample(page);
	const help = page.getByRole('button', { name: 'About Lightmile' });
	const panel = page.locator('#lightmile-info');
	await help.focus();
	await expect(panel).toBeVisible();
	await panel.hover();
	await page.locator('#userName').focus();
	await expect(page.locator('#userName')).toBeFocused();
	await expect(panel).toBeVisible();
	await expect(help).toHaveAttribute('aria-expanded', 'true');
});

test.describe('touch', () => {
	test.use({ hasTouch: true });
	test('tap toggles disclosure', async ({ page }) => {
		await uploadSample(page);
		const help = page.getByRole('button', { name: 'About Lightmile' });
		await help.tap();
		await expect(help).toHaveAttribute('aria-expanded', 'true');
		await help.tap();
		await expect(help).toHaveAttribute('aria-expanded', 'false');
	});
});
