import { expect, test } from '@playwright/test';
import { gotoUpload, uploadSample } from './helpers.js';

const names = ['English', 'Español', 'Português', 'Français', 'Deutsch', 'Nederlands'];
const codes = ['en', 'es', 'pt', 'fr', 'de', 'nl'];

test('switches language with links', async ({ page }) => {
	await gotoUpload(page);
	const button = page.getByRole('button', { name: 'EN, language: English' });
	await expect(button).toContainText('EN');
	await button.click();
	for (const [index, name] of names.entries()) {
		const item = page.getByRole('menuitem', { name });
		await expect(item).toHaveAttribute('lang', codes[index]);
		await expect(item).toHaveAttribute('hreflang', codes[index]);
	}
	await page.getByRole('menuitem', { name: 'Español' }).click();
	await expect(page).toHaveURL(/\/es\/$/);
	await expect(page.getByRole('button', { name: 'ES, idioma: Español' })).toBeVisible();
});

test('supports menu keyboard navigation', async ({ page }) => {
	await gotoUpload(page);
	const button = page.getByRole('button', { name: 'EN, language: English' });
	await button.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('menuitem', { name: 'English' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'Español' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(button).toBeFocused();
	await expect(page.getByRole('menu')).toHaveCount(0);
});

test('preserves uploaded dashboard', async ({ page }) => {
	await uploadSample(page);
	const summary = page.getByTestId('activity-summary');
	const count = (await summary.textContent())?.match(/\d+/)?.[0];
	await page.getByRole('button', { name: 'EN, language: English' }).click();
	await page.getByRole('menuitem', { name: 'Deutsch' }).click();
	await expect(page).toHaveURL(/\/de\/$/);
	await expect(summary).toContainText(count!);
	await expect(page.locator('#file-upload')).toHaveCount(0);
});

test('names the menu and marks the current language', async ({ page }) => {
	await gotoUpload(page, '/fr/');
	await page.getByRole('button', { name: 'FR, langue : Français' }).click();
	await expect(page.getByRole('menu', { name: 'Langue', exact: true })).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Français' })).toHaveAttribute(
		'aria-current',
		'true'
	);
	await expect(page.getByRole('menuitem', { name: 'English' })).not.toHaveAttribute('aria-current');
});

test('dismisses stored language suggestion', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('activeyear.locale', 'es'));
	await page.reload();
	await expect(page.getByRole('link', { name: 'Ver en español' })).toBeVisible();
	const dismiss = page.getByRole('button', { name: 'Descartar sugerencia de idioma' });
	await expect(dismiss).toHaveAttribute('lang', 'es');
	await dismiss.click();
	await expect(page.getByRole('button', { name: 'EN, language: English' })).toBeFocused();
	await expect(page.getByRole('link', { name: 'Ver en español' })).toHaveCount(0);
	await page.reload();
	await expect(page.getByRole('link', { name: 'Ver en español' })).toHaveCount(0);
});

test('keeps the suggestion text clear of the dismiss button and its focus ring', async ({
	page
}) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('activeyear.locale', 'fr'));
	await page.reload();
	const link = await page.getByRole('link', { name: 'Voir en français' }).boundingBox();
	const dismiss = await page.getByRole('button', { name: /suggestion/ }).boundingBox();
	// Each focus ring reaches 4px outside its box: 2px wide at a 2px offset.
	expect(dismiss!.x - (link!.x + link!.width)).toBeGreaterThanOrEqual(8);
});

test('the suggestion stays on the start screen', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('activeyear.locale', 'es'));
	await page.reload();
	await expect(page.getByRole('link', { name: 'Ver en español' })).toBeVisible();
	await page.getByRole('button', { name: /demo data/i }).click();
	await expect(page.getByTestId('activity-summary')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Ver en español' })).toHaveCount(0);
});

for (const width of [320, 375, 430]) {
	test(`the suggestion clears the logotype at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('activeyear.locale', 'nl'));
		await page.reload();
		const prompt = page.getByRole('link', { name: 'Bekijk in het Nederlands' }).locator('..');
		await expect(prompt).toBeVisible();
		const box = (await prompt.boundingBox())!;
		const logo = (await page.locator('h1').boundingBox())!;
		expect(box.y + box.height).toBeLessThanOrEqual(logo.y);
		expect(box.x).toBeGreaterThanOrEqual(0);
	});
}

test.describe('fresh German-speaking visitor', () => {
	test.use({ locale: 'de-DE' });
	test('suggests German', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: 'Auf Deutsch ansehen' })).toBeVisible();
	});
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });
	test('provides language links', async ({ page }) => {
		await page.goto('/es/');
		for (const [index, name] of names.entries()) {
			await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute(
				'hreflang',
				codes[index]
			);
		}
	});
});
