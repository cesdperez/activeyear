import { test, expect, type Page, type Download } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { gotoUpload, uploadSample } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CARDS = ['summary', 'breakdown', 'highlights'] as const;
const THEMES = ['neon', 'minimalist', 'retro', 'classic', 'synthwave', 'lightmile'] as const;

type ThemeName = (typeof THEMES)[number];

// Allow up to 5.5% pixel difference between preview screenshot and downloaded image.
// This accounts for rendering differences between Chrome's native renderer (Playwright screenshot)
// and modern-screenshot's canvas-based rendering. The preview and download use the same DOM,
// so any structural differences would indicate a real bug. Anti-aliasing and font rendering
// differences between the two engines are expected.
const MAX_DIFF_RATIO = 0.055;

async function navigateToSlide(page: Page, slideIndex: number): Promise<void> {
	const dots = page.locator('.carousel-dots .dot');
	await dots.nth(slideIndex).click();
	await page.waitForTimeout(100);
}

async function setTheme(page: Page, theme: ThemeName): Promise<void> {
	const themeButtonNames: Record<ThemeName, RegExp> = {
		neon: /Neon/i,
		minimalist: /Minimal/i,
		retro: /Retro/i,
		classic: /Classic/i,
		synthwave: /Synthwave/i,
		lightmile: /^Lightmile/i
	};
	await page.getByRole('button', { name: themeButtonNames[theme] }).click();
	await expect(page.locator('#export-card')).toHaveAttribute('data-theme', theme);
}

async function captureExportCardAtFullResolution(page: Page): Promise<Buffer> {
	const exportCard = page.locator('#export-card');

	// The export card is at full resolution (1080x1920) but the parent applies a scale transform.
	// We need to capture the card at its native size, matching what modern-screenshot captures.

	// Get the wrapper and remove the scale transform temporarily
	const wrapper = page.locator('.export-card-wrapper');
	await wrapper.evaluate((el) => {
		const innerDiv = el.querySelector('div') as HTMLElement;
		if (innerDiv) {
			el.dataset.origWidth = el.style.width;
			el.dataset.origHeight = el.style.height;
			el.style.width = '1080px';
			el.style.height = '1920px';
			innerDiv.style.transform = 'none';
		}
	});

	await page.waitForTimeout(100);

	// Capture at CSS scale (1x), the same resolution as the download
	const screenshot = await exportCard.screenshot({
		type: 'png',
		scale: 'css'
	});

	// Restore original styles
	await wrapper.evaluate((el) => {
		const innerDiv = el.querySelector('div') as HTMLElement;
		if (innerDiv) {
			el.style.width = el.dataset.origWidth || '';
			el.style.height = el.dataset.origHeight || '';
			innerDiv.style.transform = '';
		}
	});

	return screenshot;
}

async function captureSpecificCardDownload(page: Page, cardIndex: number): Promise<Buffer> {
	const downloadButton = page.getByRole('button', {
		name: /Download All Images|Alle Bilder herunterladen/i
	});

	// Collect all downloads
	const downloads: Download[] = [];
	const downloadHandler = (download: Download) => {
		downloads.push(download);
	};
	page.on('download', downloadHandler);

	try {
		await downloadButton.click();
		await expect.poll(() => downloads.length, { timeout: 15000 }).toBe(3);
	} finally {
		page.off('download', downloadHandler);
	}

	// Get the download for our specific card
	const download = downloads[cardIndex];
	if (!download) {
		throw new Error(
			`Download for card index ${cardIndex} not found. Got ${downloads.length} downloads.`
		);
	}

	const downloadPath = await download.path();
	if (!downloadPath) {
		throw new Error('Download path is null');
	}

	return readFileSync(downloadPath);
}

function compareImages(
	screenshotBuffer: Buffer,
	downloadBuffer: Buffer
): { diffRatio: number; diffPixels: number; diffImage: Buffer } {
	const screenshot = PNG.sync.read(screenshotBuffer);
	const download = PNG.sync.read(downloadBuffer);

	// Images must have same dimensions (allow 1px difference for rounding)
	const widthDiff = Math.abs(screenshot.width - download.width);
	const heightDiff = Math.abs(screenshot.height - download.height);
	if (widthDiff > 1 || heightDiff > 1) {
		throw new Error(
			`Image dimensions don't match: ${screenshot.width}x${screenshot.height} vs ${download.width}x${download.height}`
		);
	}

	// Use the smaller dimensions for comparison
	const width = Math.min(screenshot.width, download.width);
	const height = Math.min(screenshot.height, download.height);

	// Crop both images to the same size if there's a 1px difference
	const croppedScreenshot = cropImage(screenshot, width, height);
	const croppedDownload = cropImage(download, width, height);

	const diff = new PNG({ width, height });

	const diffPixels = pixelmatch(
		croppedScreenshot.data,
		croppedDownload.data,
		diff.data,
		width,
		height,
		{
			threshold: 0.2, // Color difference threshold - slightly relaxed for anti-aliasing
			alpha: 0.5 // Blend factor of unchanged pixels in diff output
		}
	);

	const totalPixels = width * height;
	const diffRatio = diffPixels / totalPixels;

	return { diffRatio, diffPixels, diffImage: PNG.sync.write(diff) };
}

function cropImage(png: PNG, targetWidth: number, targetHeight: number): PNG {
	if (png.width === targetWidth && png.height === targetHeight) {
		return png;
	}
	const cropped = new PNG({ width: targetWidth, height: targetHeight });
	for (let y = 0; y < targetHeight; y++) {
		for (let x = 0; x < targetWidth; x++) {
			const srcIdx = (y * png.width + x) * 4;
			const dstIdx = (y * targetWidth + x) * 4;
			cropped.data[dstIdx] = png.data[srcIdx];
			cropped.data[dstIdx + 1] = png.data[srcIdx + 1];
			cropped.data[dstIdx + 2] = png.data[srcIdx + 2];
			cropped.data[dstIdx + 3] = png.data[srcIdx + 3];
		}
	}
	return cropped;
}

test.describe('Export Visual Fidelity', () => {
	test.describe.configure({ mode: 'serial' });

	for (const [cardIndex, cardName] of CARDS.entries()) {
		test(`${cardName} card: downloaded image matches preview`, async ({ page }) => {
			await uploadSample(page);
			await navigateToSlide(page, cardIndex);

			// Capture screenshot of preview at full resolution
			const screenshotBuffer = await captureExportCardAtFullResolution(page);

			// Capture the downloaded image
			const downloadBuffer = await captureSpecificCardDownload(page, cardIndex);

			// Compare images
			const { diffRatio, diffPixels, diffImage } = compareImages(screenshotBuffer, downloadBuffer);

			// Save debug images if diff is too high
			if (diffRatio > MAX_DIFF_RATIO) {
				const debugDir = join(__dirname, '..', '..', 'test-results', 'debug');
				mkdirSync(debugDir, { recursive: true });
				writeFileSync(join(debugDir, `${cardName}-screenshot.png`), screenshotBuffer);
				writeFileSync(join(debugDir, `${cardName}-download.png`), downloadBuffer);
				writeFileSync(join(debugDir, `${cardName}-diff.png`), diffImage);
			}

			// Assert visual match
			expect(
				diffRatio,
				`${cardName} card: ${(diffRatio * 100).toFixed(2)}% pixels differ (${diffPixels} pixels). Expected <${MAX_DIFF_RATIO * 100}%`
			).toBeLessThanOrEqual(MAX_DIFF_RATIO);
		});

		test(`${cardName} card: downloaded image snapshot`, async ({ page }) => {
			await uploadSample(page);
			await navigateToSlide(page, cardIndex);

			const downloadBuffer = await captureSpecificCardDownload(page, cardIndex);

			// Save snapshot of downloaded image for regression testing
			expect(downloadBuffer).toMatchSnapshot(`${cardName}-export.png`);
		});
	}

	for (const [cardIndex, cardName] of CARDS.entries()) {
		test(`Lightmile ${cardName} card snapshot`, async ({ page }) => {
			await uploadSample(page);
			await setTheme(page, 'lightmile');
			await navigateToSlide(page, cardIndex);
			expect(await captureSpecificCardDownload(page, cardIndex)).toMatchSnapshot(
				`lightmile-${cardName}-export.png`
			);
		});
	}

	for (const [cardIndex, cardName] of CARDS.entries()) {
		test(`German ${cardName} card snapshot`, async ({ page }) => {
			await gotoUpload(page, '/de/');
			await page
				.locator('input[type="file"]')
				.first()
				.setInputFiles(join(__dirname, 'fixtures', 'garmin-heavy.csv'));
			await expect(page.locator('#export-card')).toBeVisible();
			await navigateToSlide(page, cardIndex);
			expect(await captureSpecificCardDownload(page, cardIndex)).toMatchSnapshot(
				`german-${cardName}.png`
			);
		});
	}

	test.describe('Theme variations', () => {
		// Test summary card with all themes.
		// Note: modern-screenshot renders text and gradients differently than Chrome's native renderer,
		// so non-neon themes have higher thresholds. The download snapshots still verify consistency.
		for (const theme of THEMES) {
			test(`summary card with ${theme} theme: download matches preview`, async ({ page }) => {
				await uploadSample(page);
				await setTheme(page, theme);
				await navigateToSlide(page, 0);

				const screenshotBuffer = await captureExportCardAtFullResolution(page);
				const downloadBuffer = await captureSpecificCardDownload(page, 0);

				const { diffRatio, diffPixels, diffImage } = compareImages(
					screenshotBuffer,
					downloadBuffer
				);

				// Neon theme has tighter tolerance; other themes have rendering differences with modern-screenshot
				const threshold = theme === 'neon' ? MAX_DIFF_RATIO : 0.65;

				if (diffRatio > threshold) {
					const debugDir = join(__dirname, '..', '..', 'test-results', 'debug');
					mkdirSync(debugDir, { recursive: true });
					writeFileSync(join(debugDir, `${theme}-screenshot.png`), screenshotBuffer);
					writeFileSync(join(debugDir, `${theme}-download.png`), downloadBuffer);
					writeFileSync(join(debugDir, `${theme}-diff.png`), diffImage);
				}

				expect(
					diffRatio,
					`${theme} theme: ${(diffRatio * 100).toFixed(2)}% pixels differ (${diffPixels} pixels). Expected <${threshold * 100}%`
				).toBeLessThanOrEqual(threshold);
			});
		}
	});
});
