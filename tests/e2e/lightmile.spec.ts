import { test, expect } from '@playwright/test';
import { uploadSample } from './helpers.js';

test.use({ viewport: { width: 390, height: 844 } });

test('export branding follows the selected theme', async ({ page }) => {
	await uploadSample(page);
	const card = page.locator('#export-card');
	await page.getByRole('button', { name: /Lightmile Paper/ }).click();
	await expect(card.getByRole('img', { name: 'Lightmile' })).toHaveCount(1);
	await expect(card.getByText('lightmile.nl', { exact: false })).toHaveCount(1);
	await page.getByRole('button', { name: /Classic/i }).click();
	await expect(card.getByRole('img', { name: 'Lightmile' })).toHaveCount(0);
	await expect(card.getByText('lightmile.nl', { exact: false })).toHaveCount(0);
});

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

test('the help button is a 24px target clear of the theme options', async ({ page }) => {
	await uploadSample(page);
	const help = await page.getByRole('button', { name: 'About Lightmile' }).boundingBox();
	expect(help!.width).toBeGreaterThanOrEqual(24);
	expect(help!.height).toBeGreaterThanOrEqual(24);
	const options = await page
		.locator('[aria-labelledby="theme-label"] button.toggle')
		.evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().toJSON()));
	for (const { x, y, width, height } of options)
		expect(
			help!.x < x + width &&
				help!.x + help!.width > x &&
				help!.y < y + height &&
				help!.y + help!.height > y
		).toBe(false);
});

test('clicking the help button after hovering keeps it open', async ({ page }) => {
	await uploadSample(page);
	const help = page.getByRole('button', { name: 'About Lightmile' });
	await help.hover();
	await expect(help).toHaveAttribute('aria-expanded', 'true');
	await help.click();
	await expect(help).toHaveAttribute('aria-expanded', 'true');
	await page.mouse.move(0, 0);
	await page.waitForTimeout(400);
	await expect(page.locator('#lightmile-info')).toBeVisible();
	await help.click();
	await expect(help).toHaveAttribute('aria-expanded', 'false');
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

	test('tapping outside closes it', async ({ page }) => {
		await uploadSample(page);
		const help = page.getByRole('button', { name: 'About Lightmile' });
		await help.tap();
		await expect(page.locator('#lightmile-info')).toBeVisible();
		await page.getByRole('heading', { name: 'Export' }).tap();
		await expect(page.locator('#lightmile-info')).toBeHidden();
		await expect(help).toHaveAttribute('aria-expanded', 'false');
	});

	test('opening near the bottom keeps the link visible', async ({ page }) => {
		await uploadSample(page);
		const help = page.getByRole('button', { name: 'About Lightmile' });
		await help.scrollIntoViewIfNeeded();
		await help.evaluate((button) => {
			window.scrollBy(0, button.getBoundingClientRect().bottom - window.innerHeight + 30);
		});
		const bottom = await help.evaluate((button) => button.getBoundingClientRect().bottom);
		expect(bottom).toBeGreaterThan(804);
		await help.tap();
		const link = page.getByRole('link', { name: 'lightmile.nl' });
		await expect(link).toBeVisible();
		await expect
			.poll(async () => (await link.boundingBox())!.y + (await link.boundingBox())!.height)
			.toBeLessThanOrEqual(844);
	});
});
