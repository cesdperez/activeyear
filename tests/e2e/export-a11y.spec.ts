import { test, expect, type Download, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { uploadSample } from './helpers.js';

const VALID_PNG = {
	name: 'avatar.png',
	mimeType: 'image/png',
	buffer: Buffer.from(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
		'base64'
	)
};

const CORRUPT_PNG = { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not a png') };

const TEXT_FILE = { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') };

function collectDownloads(page: Page, count: number): Promise<Download[]> {
	const downloads: Download[] = [];
	return new Promise((resolve) => {
		const onDownload = (download: Download) => {
			downloads.push(download);
			if (downloads.length === count) {
				page.off('download', onDownload);
				resolve(downloads);
			}
		};
		page.on('download', onDownload);
	});
}

test.describe('Export panel accessibility', () => {
	test('profile picture upload is reachable by keyboard and focus returns after removal', async ({
		page
	}) => {
		await uploadSample(page);

		await page.locator('#userName').focus();
		await page.keyboard.press('Tab');
		const avatarInput = page.locator('#userAvatar');
		await expect(avatarInput).toBeFocused();

		await avatarInput.setInputFiles(VALID_PNG);
		const removeButton = page.getByRole('button', { name: 'Remove image' });
		await expect(removeButton).toBeFocused();
		await page.keyboard.press('Enter');

		await expect(page.locator('#userAvatar')).toBeFocused();
	});

	test('avatar errors show next to the avatar control and clear after a valid upload', async ({
		page
	}) => {
		await uploadSample(page);
		const avatarInput = page.locator('#userAvatar');

		await avatarInput.setInputFiles(TEXT_FILE);
		const avatarError = page.locator('#userAvatar-error');
		await expect(avatarError).toHaveText(/upload an image file/i);
		await expect(avatarError).toHaveAttribute('role', 'alert');
		await expect(avatarInput).toHaveAttribute('aria-describedby', 'userAvatar-error');
		await expect(avatarInput).toHaveValue('');

		await avatarInput.setInputFiles(CORRUPT_PNG);
		await expect(avatarError).toHaveText(/could not be read/i);
		await expect(page.getByRole('button', { name: 'Remove image' })).toHaveCount(0);

		await avatarInput.setInputFiles(VALID_PNG);
		await expect(page.getByRole('button', { name: 'Remove image' })).toBeVisible();
		await expect(page.getByText(/upload an image file|could not be read/i)).toHaveCount(0);
	});

	test('name input autocompletes the user name', async ({ page }) => {
		await uploadSample(page);
		await expect(page.locator('#userName')).toHaveAttribute('autocomplete', 'name');
	});

	test('stat and theme groups are labelled and expose the selected button', async ({ page }) => {
		await uploadSample(page);

		const statGroup = page.getByRole('group', { name: /Focused Stat/ });
		await expect(statGroup.getByRole('button', { name: 'Distance' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await statGroup.getByRole('button', { name: 'Time' }).click();
		await expect(statGroup.getByRole('button', { name: 'Time' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expect(statGroup.getByRole('button', { name: 'Distance' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);

		const themeGroup = page.getByRole('group', { name: 'Theme' });
		await themeGroup.getByRole('button', { name: /Retro/ }).click();
		await expect(themeGroup.getByRole('button', { name: /Retro/ })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expect(themeGroup.getByRole('button', { name: /Neon/ })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	});

	test('download keeps focus and reports progress and completion in a status region', async ({
		page
	}) => {
		await uploadSample(page);
		const downloads = collectDownloads(page, 3);

		const downloadButton = page.locator('#export-download');
		await downloadButton.focus();
		await page.keyboard.press('Enter');

		const status = page.locator('#export-status');
		await expect(status).toHaveAttribute('role', 'status');
		await expect(status).toHaveText(/Generating/i);
		await expect(downloadButton).toBeFocused();
		await expect(downloadButton).toHaveAttribute('aria-disabled', 'true');

		await downloads;
		await expect(status).toHaveText(/Downloaded/i);
		await expect(downloadButton).toBeFocused();
		await expect(downloadButton).not.toHaveAttribute('aria-disabled', 'true');
	});

	test('controls that change the cards are frozen while exporting, so each file is a different card', async ({
		page
	}) => {
		await uploadSample(page);
		const downloads = collectDownloads(page, 3);

		await page.locator('#export-download').click();

		await expect(page.getByRole('button', { name: /Retro/ })).toBeDisabled();
		await expect(page.getByRole('button', { name: 'Elevation' })).toBeDisabled();
		await expect(page.locator('#userName')).toBeDisabled();
		await expect(page.getByRole('button', { name: 'Next slide' })).toBeDisabled();
		await expect(page.locator('.carousel-dots .dot').first()).toBeDisabled();
		const unitGroup = page.getByRole('group', { name: 'Distance unit' });
		await expect(unitGroup.getByRole('button', { name: 'mi' })).toBeDisabled();
		const metricGroup = page.getByRole('group', { name: 'Breakdown metric' });
		await expect(metricGroup.getByRole('button', { name: 'Time' })).toBeDisabled();
		await expect(page.getByRole('button', { name: /Upload different file/ })).toBeDisabled();
		for (const control of [
			page.getByRole('button', { name: /Retro/ }),
			page.getByRole('button', { name: 'Next slide' }),
			unitGroup.getByRole('button', { name: 'mi' })
		]) {
			await expect
				.poll(async () => Number(await control.evaluate((el) => getComputedStyle(el).opacity)))
				.toBeLessThan(0.75);
		}

		const files = await Promise.all(
			(await downloads).map(async (download) => readFileSync(await download.path()))
		);
		expect(files[0].equals(files[1])).toBe(false);
		expect(files[1].equals(files[2])).toBe(false);

		await expect(page.getByRole('button', { name: /Retro/ })).toBeEnabled();
		await expect(page.getByRole('button', { name: 'Next slide' })).toBeEnabled();
	});

	test('a failed export restores the slide, re-enables the controls and announces the error', async ({
		page
	}) => {
		await uploadSample(page);
		await page.getByRole('button', { name: 'Go to slide 2' }).click();
		await page.evaluate(() => {
			const fail = () => {
				throw new Error('canvas unavailable');
			};
			HTMLCanvasElement.prototype.toDataURL = fail;
			HTMLCanvasElement.prototype.toBlob = fail;
		});

		await page.locator('#export-download').click();

		await expect(page.locator('#export-error')).toHaveAttribute('role', 'alert');
		await expect(page.locator('#export-error')).toHaveText(/Failed/);
		await expect(page.getByText('Breakdown (2/3)')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Next slide' })).toBeEnabled();
		await expect(page.locator('#export-download')).not.toHaveAttribute('aria-disabled', 'true');
	});
});

test.describe('Export carousel', () => {
	test('is a labelled region whose slide label is announced politely', async ({ page }) => {
		await uploadSample(page);

		const carousel = page.getByRole('region', { name: /card preview/i });
		await expect(carousel).toBeVisible();
		await expect(carousel.getByText('Summary (1/3)')).toHaveAttribute('aria-live', 'polite');
	});

	test('dots mark the current slide and have a 24px hit area', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute(
			'aria-current',
			'true'
		);
		await page.getByRole('button', { name: 'Go to slide 3' }).click();
		await expect(page.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute(
			'aria-current',
			'true'
		);
		await expect(page.getByRole('button', { name: 'Go to slide 1' })).not.toHaveAttribute(
			'aria-current'
		);

		for (const dot of await page.locator('.carousel-dots .dot').all()) {
			const box = await dot.boundingBox();
			expect(box?.width).toBeGreaterThanOrEqual(24);
			expect(box?.height).toBeGreaterThanOrEqual(24);
		}
	});

	test('arrow keys change slides when the carousel has focus', async ({ page }) => {
		await uploadSample(page);

		const carousel = page.getByRole('region', { name: /card preview/i });
		await carousel.focus();
		await page.keyboard.press('ArrowRight');
		await expect(carousel.getByText('Breakdown (2/3)')).toBeVisible();
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowLeft');
		await expect(carousel.getByText('Highlights (3/3)')).toBeVisible();
	});

	test('horizontal swipe changes slides and a mostly vertical drag does not', async ({ page }) => {
		await uploadSample(page);

		const card = page.locator('.carousel-card');
		await card.scrollIntoViewIfNeeded();
		const box = await card.boundingBox();
		if (!box) throw new Error('carousel card not rendered');
		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		async function drag(dx: number, dy: number) {
			await page.mouse.move(centerX, centerY);
			await page.mouse.down();
			await page.mouse.move(centerX + dx, centerY + dy, { steps: 5 });
			await page.mouse.up();
		}

		await drag(-120, 10);
		await expect(page.getByText('Breakdown (2/3)')).toBeVisible();

		await drag(60, 150);
		await expect(page.getByText('Breakdown (2/3)')).toBeVisible();

		await drag(120, 0);
		await expect(page.getByText('Summary (1/3)')).toBeVisible();
	});
});
