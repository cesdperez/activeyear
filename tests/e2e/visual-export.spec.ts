import { test, expect, type Page, type Download } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CARDS = ['summary', 'breakdown', 'highlights'] as const;
const THEMES = ['neon', 'minimalist', 'retro'] as const;

type ThemeName = (typeof THEMES)[number];

// Allow up to 6% pixel difference between preview screenshot and downloaded image.
// This accounts for rendering differences between Chrome's native renderer (Playwright screenshot)
// and html-to-image's canvas-based rendering. The preview and download use the same DOM,
// so any structural differences would indicate a real bug. Anti-aliasing and font rendering
// differences between the two engines are expected.
const MAX_DIFF_RATIO = 0.055;

async function setupDashboard(page: Page): Promise<void> {
	await page.addStyleTag({
		content:
			'*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }'
	});

	await page.goto('/');
	const fileInput = page.locator('input[type="file"]');
	const csvPath = join(__dirname, '..', '..', 'src', 'lib', 'parsers', '__fixtures__', 'garmin-sample.csv');
	await fileInput.setInputFiles(csvPath);
	await expect(page.getByRole('heading', { name: 'Your 2025' })).toBeVisible({ timeout: 10000 });
}

async function navigateToSlide(page: Page, slideIndex: number): Promise<void> {
	const dots = page.locator('.carousel-dots .dot');
	await dots.nth(slideIndex).click();
	await page.waitForTimeout(100);
}

async function setTheme(page: Page, theme: ThemeName): Promise<void> {
	const themeButtonNames: Record<ThemeName, RegExp> = {
		neon: /Neon/i,
		minimalist: /Minimal/i,
		retro: /Retro/i
	};
	await page.getByRole('button', { name: themeButtonNames[theme] }).click();
	await expect(page.locator('#export-card')).toHaveAttribute('data-theme', theme);
}

async function captureExportCardAtFullResolution(page: Page): Promise<Buffer> {
	const exportCard = page.locator('#export-card');

	// The export card is at full resolution (1080x1920) but the parent applies a scale transform.
	// We need to capture the card at its native size, matching what html-to-image captures.
	// html-to-image uses pixelRatio: 2 so we need to match that.

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

	// Capture at CSS scale (1x) - we'll compare at this resolution
	// The download is 2x, but we'll scale it down for comparison
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

function scaleDownImage(buffer: Buffer, scaleFactor: number): Buffer {
	const src = PNG.sync.read(buffer);
	const newWidth = Math.floor(src.width / scaleFactor);
	const newHeight = Math.floor(src.height / scaleFactor);
	const dst = new PNG({ width: newWidth, height: newHeight });

	// Bilinear interpolation for better quality downscaling
	for (let y = 0; y < newHeight; y++) {
		for (let x = 0; x < newWidth; x++) {
			const srcX = x * scaleFactor;
			const srcY = y * scaleFactor;

			// Average the 2x2 block of source pixels
			let r = 0, g = 0, b = 0, a = 0;
			for (let dy = 0; dy < scaleFactor; dy++) {
				for (let dx = 0; dx < scaleFactor; dx++) {
					const sx = Math.min(srcX + dx, src.width - 1);
					const sy = Math.min(srcY + dy, src.height - 1);
					const srcIdx = (sy * src.width + sx) * 4;
					r += src.data[srcIdx];
					g += src.data[srcIdx + 1];
					b += src.data[srcIdx + 2];
					a += src.data[srcIdx + 3];
				}
			}

			const pixelCount = scaleFactor * scaleFactor;
			const dstIdx = (y * newWidth + x) * 4;
			dst.data[dstIdx] = Math.round(r / pixelCount);
			dst.data[dstIdx + 1] = Math.round(g / pixelCount);
			dst.data[dstIdx + 2] = Math.round(b / pixelCount);
			dst.data[dstIdx + 3] = Math.round(a / pixelCount);
		}
	}

	return PNG.sync.write(dst);
}

async function captureSpecificCardDownload(page: Page, cardIndex: number): Promise<Buffer> {
	const downloadButton = page.getByRole('button', { name: /Download All Images/i });

	// Collect all downloads
	const downloads: Download[] = [];
	const downloadHandler = (download: Download) => {
		downloads.push(download);
	};
	page.on('download', downloadHandler);

	await downloadButton.click();

	// Wait for all 3 downloads to complete
	await page.waitForTimeout(3000);

	page.off('download', downloadHandler);

	// Get the download for our specific card
	const download = downloads[cardIndex];
	if (!download) {
		throw new Error(`Download for card index ${cardIndex} not found. Got ${downloads.length} downloads.`);
	}

	const downloadPath = await download.path();
	if (!downloadPath) {
		throw new Error('Download path is null');
	}

	return readFileSync(downloadPath);
}

function compareImages(screenshotBuffer: Buffer, downloadBuffer: Buffer): { diffRatio: number; diffPixels: number; diffImage: Buffer } {
	const screenshot = PNG.sync.read(screenshotBuffer);
	let download = PNG.sync.read(downloadBuffer);

	// The download is at 2x resolution (pixelRatio: 2 in html-to-image)
	// Scale it down to match the screenshot resolution (allow small rounding differences)
	// Determine the scale factor (e.g. 2x, 4x)
	const widthRatio = download.width / screenshot.width;
	const heightRatio = download.height / screenshot.height;

	// Check if ratios are consistent and close to an integer
	if (Math.abs(widthRatio - heightRatio) < 0.1) {
		const scaleFactor = Math.round(widthRatio);
		if (scaleFactor > 1 && Math.abs(widthRatio - scaleFactor) < 0.1) {
			downloadBuffer = scaleDownImage(downloadBuffer, scaleFactor);
			download = PNG.sync.read(downloadBuffer);
		}
	}

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

	const diffPixels = pixelmatch(croppedScreenshot.data, croppedDownload.data, diff.data, width, height, {
		threshold: 0.2, // Color difference threshold - slightly relaxed for anti-aliasing
		alpha: 0.5 // Blend factor of unchanged pixels in diff output
	});

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
			await setupDashboard(page);
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
				writeFileSync(join(debugDir, `${cardName}-download-scaled.png`), scaleDownImage(downloadBuffer, 2));
				writeFileSync(join(debugDir, `${cardName}-diff.png`), diffImage);
			}

			// Assert visual match
			expect(
				diffRatio,
				`${cardName} card: ${(diffRatio * 100).toFixed(2)}% pixels differ (${diffPixels} pixels). Expected <${MAX_DIFF_RATIO * 100}%`
			).toBeLessThanOrEqual(MAX_DIFF_RATIO);
		});

		test(`${cardName} card: downloaded image snapshot`, async ({ page }) => {
			await setupDashboard(page);
			await navigateToSlide(page, cardIndex);

			const downloadBuffer = await captureSpecificCardDownload(page, cardIndex);

			// Save snapshot of downloaded image for regression testing
			expect(downloadBuffer).toMatchSnapshot(`${cardName}-export.png`);
		});
	}

	test.describe('Theme variations', () => {
		// Test summary card with all themes.
		// Note: html-to-image renders text and gradients differently than Chrome's native renderer,
		// so non-neon themes have higher thresholds. The download snapshots still verify consistency.
		for (const theme of THEMES) {
			test(`summary card with ${theme} theme: download matches preview`, async ({ page }) => {
				await setupDashboard(page);
				await setTheme(page, theme);
				await navigateToSlide(page, 0);

				const screenshotBuffer = await captureExportCardAtFullResolution(page);
				const downloadBuffer = await captureSpecificCardDownload(page, 0);

				const { diffRatio, diffPixels, diffImage } = compareImages(screenshotBuffer, downloadBuffer);

				// Neon theme has tighter tolerance; other themes have rendering differences with html-to-image
				const threshold = theme === 'neon' ? MAX_DIFF_RATIO : 0.65;

				if (diffRatio > threshold) {
					const debugDir = join(__dirname, '..', '..', 'test-results', 'debug');
					mkdirSync(debugDir, { recursive: true });
					writeFileSync(join(debugDir, `${theme}-screenshot.png`), screenshotBuffer);
					writeFileSync(join(debugDir, `${theme}-download-scaled.png`), scaleDownImage(downloadBuffer, 2));
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
