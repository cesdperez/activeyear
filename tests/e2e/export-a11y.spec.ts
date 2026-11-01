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
		await removeButton.focus();
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
		await expect(avatarInput).toHaveAttribute('aria-describedby', 'userAvatar-error');

		await avatarInput.setInputFiles(CORRUPT_PNG);
		await expect(avatarError).toHaveText(/could not be read/i);
		await expect(page.getByRole('button', { name: 'Remove image' })).toHaveCount(0);

		await avatarInput.setInputFiles(VALID_PNG);
		await expect(page.getByRole('button', { name: 'Remove image' })).toBeVisible();
		await expect(page.getByText(/upload an image file|could not be read/i)).toHaveCount(0);
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
