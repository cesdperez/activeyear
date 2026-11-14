import { test, expect, type Download, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { garminCsv, showSlide, uploadCsv, uploadSample } from './helpers.js';

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
	test('name and photo come first among the export controls', async ({ page }) => {
		await uploadSample(page);
		const name = page.getByRole('textbox', { name: 'Your name' });
		await expect(name).toHaveAttribute('id', 'userName');
		await expect(page.getByText('Your name and photo (optional)')).toBeVisible();
		const nameBox = (await name.boundingBox())!;
		const avatar = (await page.locator('label[for="userAvatar"]').boundingBox())!;
		const theme = (await page.getByRole('group', { name: 'Theme' }).boundingBox())!;
		expect(Math.abs(avatar.y + avatar.height / 2 - (nameBox.y + nameBox.height / 2))).toBeLessThan(
			2
		);
		expect(nameBox.y + nameBox.height).toBeLessThan(theme.y);
	});

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

	test('choosing the same bad avatar file again re-announces the error', async ({ page }) => {
		await uploadSample(page);
		const avatarInput = page.locator('#userAvatar');
		const avatarError = page.locator('#userAvatar-error');

		await avatarInput.setInputFiles(TEXT_FILE);
		await expect(avatarError).toBeVisible();
		await avatarError.evaluate((alert) => alert.setAttribute('data-announced', ''));

		await avatarInput.setInputFiles(TEXT_FILE);

		await expect(avatarError).toBeVisible();
		await expect(avatarError).not.toHaveAttribute('data-announced');
	});

	test('name input autocompletes the user name', async ({ page }) => {
		await uploadSample(page);
		await expect(page.locator('#userName')).toHaveAttribute('autocomplete', 'name');
	});

	test('stat and theme groups are labelled and expose the selected button', async ({ page }) => {
		await uploadSample(page);

		const statGroup = page.getByRole('group', { name: /Headline stat/ });
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
		await expect(page.getByRole('button', { name: 'Back to start' })).toBeDisabled();
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
		await expect(page.getByText('Breakdown (2/3)')).toBeVisible();
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

test.describe('Export card semantics', () => {
	for (const slide of [0, 1, 2]) {
		test(`card ${slide + 1} hides its icons and adds no headings to the page`, async ({ page }) => {
			await uploadSample(page);
			await showSlide(page, slide);
			const card = page.locator('#export-card');

			const unnamedImages = await card.evaluate(
				(el) =>
					[...el.querySelectorAll('svg[role="img"]:not([aria-label])')].filter(
						(svg) => !svg.closest('[aria-hidden="true"]')
					).length
			);
			expect(unnamedImages).toBe(0);
			await expect(card.getByRole('heading')).toHaveCount(0);
			await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
		});
	}
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

	test('a focused dot gets a round ring around the dot, not its hit area', async ({ page }) => {
		await uploadSample(page);
		await page.getByRole('button', { name: 'Previous slide' }).focus();
		await page.keyboard.press('Tab');

		const dot = page.getByRole('button', { name: 'Go to slide 1' });
		await expect(dot).toBeFocused();
		const ring = await dot.evaluate((el) => {
			const before = getComputedStyle(el, '::before');
			return {
				button: getComputedStyle(el).outlineStyle,
				dot: before.outlineStyle,
				radius: before.borderRadius
			};
		});
		expect(ring).toEqual({ button: 'none', dot: 'solid', radius: '9999px' });
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

test.describe('Export progress and results', () => {
	test('the visible preview stays on its slide while every card exports', async ({ page }) => {
		await uploadSample(page);
		await page.evaluate(() => {
			const label = document.querySelector('.slide-label')!;
			const seen = new Set([label.textContent]);
			new MutationObserver(() => seen.add(label.textContent)).observe(label, {
				subtree: true,
				characterData: true,
				childList: true
			});
			Object.assign(window, { seenSlides: seen });
		});
		const downloads = collectDownloads(page, 3);

		await page.locator('#export-download').click();
		await downloads;

		const seen = await page.evaluate(() => [
			...(window as unknown as { seenSlides: Set<string> }).seenSlides
		]);
		expect(seen).toEqual(['Summary (1/3)']);
		await expect(page.locator('[id="export-card"]')).toHaveCount(1);
	});

	test('a finished export shows a visible confirmation next to the button', async ({ page }) => {
		await uploadSample(page);
		const downloads = collectDownloads(page, 3);

		await page.locator('#export-download').click();
		await downloads;

		const confirmation = page.getByText('Downloaded three images', { exact: true }).last();
		await expect(confirmation).toBeVisible();
		const button = await page.locator('#export-download').boundingBox();
		const note = await confirmation.boundingBox();
		expect(note!.height).toBeGreaterThan(12);
		expect(note!.y - (button!.y + button!.height)).toBeLessThan(24);
	});

	test('an avatar error clears when the theme changes', async ({ page }) => {
		await uploadSample(page);
		await page.locator('#userAvatar').setInputFiles(TEXT_FILE);
		await expect(page.locator('#userAvatar-error')).toBeVisible();

		await page.getByRole('button', { name: /Retro/ }).click();

		await expect(page.locator('#userAvatar-error')).toHaveCount(0);
	});

	test('a large photo is stored at the size the cards draw', async ({ page }) => {
		await uploadSample(page);
		const photo = await page.evaluate(async () => {
			const canvas = document.createElement('canvas');
			canvas.width = 4000;
			canvas.height = 3000;
			const context = canvas.getContext('2d')!;
			for (let i = 0; i < 2000; i++) {
				context.fillStyle = `hsl(${i % 360} 80% 50%)`;
				context.fillRect(Math.random() * 4000, Math.random() * 3000, 200, 200);
			}
			return canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
		});
		await page.locator('#userAvatar').setInputFiles({
			name: 'photo.jpg',
			mimeType: 'image/jpeg',
			buffer: Buffer.from(photo, 'base64')
		});

		const preview = page.locator('#export-panel img').first();
		await expect(preview).toBeVisible();
		const stored = await preview.evaluate(async (img: HTMLImageElement) => {
			await img.decode();
			return { width: img.naturalWidth, height: img.naturalHeight, length: img.src.length };
		});
		expect(Math.min(stored.width, stored.height)).toBe(640);
		expect(stored.width).toBe(853);
		expect(stored.length).toBeLessThan(500_000);
	});

	test('without highlights the export promises and downloads two images', async ({ page }) => {
		await uploadCsv(page, garminCsv([{ title: 'Long run' }, { title: 'Easy run' }]));
		for (const title of ['Long run', 'Easy run'])
			await page
				.getByRole('button', { name: new RegExp(`^Remove ${title}, .+, from highlights$`) })
				.click();

		await expect(page.getByText('Downloads two images: Summary and Breakdown')).toBeVisible();
		const downloads: Download[] = [];
		page.on('download', (download) => downloads.push(download));
		await page.locator('#export-download').click();
		await expect(page.locator('#export-status')).toHaveText('Downloaded two images');
		await expect.poll(() => downloads.length).toBe(2);
		expect(downloads.map((download) => download.suggestedFilename())).toEqual([
			`activeyear-${TARGET_YEAR}-summary.png`,
			`activeyear-${TARGET_YEAR}-breakdown.png`
		]);
	});
});
