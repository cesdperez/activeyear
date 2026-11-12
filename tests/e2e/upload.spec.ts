import { test, expect, type Locator, type Page } from '@playwright/test';
import { TARGET_YEAR } from '../../src/lib/constants/time.js';
import { UPLOAD_ZONE_ID } from '../../src/lib/constants/dom.js';
import { DASHBOARD_HEADING, uploadSample } from './helpers.js';

async function uploadFileWithoutTargetYear(page: Page) {
	await page.locator('input[type="file"]').setInputFiles({
		name: 'activities.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(
			`Activity Type,Date,Title,Distance\nRunning,${TARGET_YEAR - 1}-03-01,Run,10.0`
		)
	});
}

function isFileDragCancelled(target: Locator, type: 'dragover' | 'drop') {
	return target.evaluate((element, type) => {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(new File(['Activity Type'], 'activities.csv', { type: 'text/csv' }));
		const event = new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true });
		element.dispatchEvent(event);
		return event.defaultPrevented;
	}, type);
}

test.describe('Upload Flow', () => {
	test('home page displays upload UI', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'ActiveYear' })).toBeVisible();
		await expect(page.getByText(`${DASHBOARD_HEADING} in Sport`)).toBeVisible();

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
		await expect(page.getByText('Your data never leaves this browser')).toBeVisible();
	});

	test('shows instructions for getting data', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText('How to get your data')).toBeVisible();
		await expect(page.getByText('connect.garmin.com')).toBeVisible();
		await expect(
			page.getByText("Use the website on a computer. The Garmin Connect app can't export.")
		).toBeVisible();
		await expect(
			page.getByText(`Scroll down until all ${TARGET_YEAR} activities are loaded`)
		).toBeVisible();
	});

	test('processes uploaded CSV and shows dashboard', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByText('Total Distance').first()).toBeVisible();
		await expect(page.getByText('Time Active').first()).toBeVisible();
		await expect(page.getByText('Calories Burned').first()).toBeVisible();
		await expect(page.getByText('Elevation Gained').first()).toBeVisible();

		await expect(page.getByText(/around the globe/).first()).toBeVisible();
		await expect(page.getByText(/Everest/).first()).toBeVisible();
	});

	test('allows uploading a different file', async ({ page }) => {
		await uploadSample(page);

		await page.getByRole('button', { name: 'Upload different file' }).click();

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
	});

	test('explains why an export without target year activities was rejected', async ({ page }) => {
		await page.goto('/');

		await uploadFileWithoutTargetYear(page);

		await expect(
			page.getByRole('button', { name: `No ${TARGET_YEAR} activities found in the file` })
		).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Click to try again')).toBeVisible();
	});

	test('ignores a file dropped outside the upload zone', async ({ page }) => {
		await page.goto('/');
		const heading = page.getByRole('heading', { name: 'ActiveYear' });

		expect(await isFileDragCancelled(heading, 'dragover')).toBe(true);
		expect(await isFileDragCancelled(heading, 'drop')).toBe(true);

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
		await expect(page.getByRole('status')).toBeEmpty();
	});

	test('shows no drop highlight while a file loads', async ({ page }) => {
		await page.goto('/');
		await uploadFileWithoutTargetYear(page);
		const uploadZone = page.locator(`#${UPLOAD_ZONE_ID}`);
		await expect(page.getByRole('status')).toHaveText('Analyzing activities...');

		await isFileDragCancelled(uploadZone, 'dragover');

		await expect(uploadZone).not.toHaveClass(/dragover/);
		await expect(uploadZone).toHaveCSS('cursor', 'not-allowed');
	});
});

test.describe('Upload accessibility', () => {
	const uploadZone = (page: Page) =>
		page.getByRole('button', { name: /Drop your Garmin CSV here/ });
	const demoButton = (page: Page) => page.getByRole('button', { name: /demo data/ });

	test('Space on the upload zone opens the file picker', async ({ page }) => {
		await page.goto('/');
		await uploadZone(page).focus();

		const fileChooser = page.waitForEvent('filechooser');
		await page.keyboard.press('Space');

		await fileChooser;
	});

	test('announces loading progress and errors', async ({ page }) => {
		await page.goto('/');
		await uploadFileWithoutTargetYear(page);

		await expect(page.getByRole('status')).toHaveText('Analyzing activities...');
		await expect(page.getByRole('alert')).toHaveText(
			`No ${TARGET_YEAR} activities found in the file`,
			{ timeout: 10000 }
		);
	});

	test('blocks the demo while a file loads', async ({ page }) => {
		await page.goto('/');
		await uploadFileWithoutTargetYear(page);

		await expect(demoButton(page)).toBeDisabled();
		await expect(page.getByRole('alert')).not.toBeEmpty({ timeout: 10000 });
		await expect(demoButton(page)).toBeEnabled();
	});

	test('accepts the same file again after an error', async ({ page }) => {
		await page.goto('/');
		await uploadFileWithoutTargetYear(page);

		await expect(page.getByRole('alert')).not.toBeEmpty({ timeout: 10000 });
		await expect(page.locator('input[type="file"]')).toHaveValue('');
	});

	test('moves focus to the dashboard heading after an upload', async ({ page }) => {
		await uploadSample(page);

		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeFocused();
	});

	test('moves focus to the dashboard heading after loading the demo', async ({ page }) => {
		await page.goto('/');
		await demoButton(page).click();

		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeFocused();
	});

	test('moves focus to the upload zone after choosing to upload a different file', async ({
		page
	}) => {
		await uploadSample(page);
		await page.getByRole('button', { name: 'Upload different file' }).click();

		await expect(uploadZone(page)).toBeFocused();
		await expect(demoButton(page)).toBeEnabled();
	});
});
