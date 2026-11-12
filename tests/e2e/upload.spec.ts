import { test, expect, type Locator, type Page } from '@playwright/test';
import { MIN_UPLOAD_LOADING_MS, TARGET_YEAR } from '../../src/lib/constants/time.js';
import { UPLOAD_ZONE_ID } from '../../src/lib/constants/dom.js';
import {
	DASHBOARD_HEADING,
	STRAVA_CSV,
	garminCsv,
	gotoUpload,
	uploadCsv,
	uploadSample
} from './helpers.js';

const WRONG_YEAR_MESSAGE = `This file has activities from ${TARGET_YEAR - 1}, none from ${TARGET_YEAR}`;

async function uploadFile(page: Page, csv: string) {
	await page.locator('input[type="file"]').setInputFiles({
		name: 'activities.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(csv)
	});
}

async function uploadFileWithoutTargetYear(page: Page) {
	await uploadFile(
		page,
		`Activity Type,Date,Title,Distance\nRunning,${TARGET_YEAR - 1}-03-01 08:00:00,Run,10.0`
	);
}

type SlowReadWindow = Window & { slowedFileRead?: boolean };
type ShownAtWindow = Window & { shownAt?: Record<string, number> };

// Parsing finishes in milliseconds, too fast to assert on the loading state.
async function slowFileReads(page: Page) {
	await page.addInitScript(() => {
		const read = File.prototype.text;
		File.prototype.text = function () {
			(window as SlowReadWindow).slowedFileRead = true;
			return new Promise((resolve) => setTimeout(resolve, 1500)).then(() => read.call(this));
		};
	});
}

// Fails once the app reads files another way, which would make slowFileReads a no-op.
async function expectFileReadSlowed(page: Page) {
	await expect
		.poll(() => page.evaluate(() => (window as SlowReadWindow).slowedFileRead))
		.toBe(true);
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
		await expect(page.getByRole('heading', { name: 'Strava', exact: true })).toBeVisible();
		await expect(page.getByText('Download or Delete Your Account').first()).toBeVisible();
		await expect(page.getByText('Upload only activities.csv.')).toBeVisible();
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

	test('imports a Strava account export', async ({ page }) => {
		await gotoUpload(page);
		await page.locator('input[type="file"]').setInputFiles(STRAVA_CSV);
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible({
			timeout: 10000
		});
		const stats = page.getByTestId('main-stats');
		await expect(stats.getByText('60.9km')).toBeVisible();
		await expect(stats.getByText('1,010m')).toBeVisible();
		await expect(stats.getByText('18h 40m')).toBeVisible();
	});

	test('rejects a localized Strava export', async ({ page }) => {
		await gotoUpload(page);
		await uploadFile(
			page,
			'Fecha de la actividad,Tipo de actividad,Nombre de archivo\n"31 oct 2026, 9:49:58",Carrera,activities/123.fit.gz'
		);
		await expect(page.getByRole('alert')).toContainText('English', { timeout: 10000 });
	});

	test('allows uploading a different file', async ({ page }) => {
		await uploadSample(page);

		await page.getByRole('button', { name: 'Upload different file' }).click();

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
	});

	test('shows an upload error as soon as the file is read', async ({ page }) => {
		await gotoUpload(page);

		await uploadFileWithoutTargetYear(page);

		await expect(page.getByRole('button', { name: WRONG_YEAR_MESSAGE })).toBeVisible({
			timeout: MIN_UPLOAD_LOADING_MS + 2000
		});
	});

	test('keeps the loading state up for a moment before showing an error', async ({ page }) => {
		await page.addInitScript(() => {
			const shownAt: Record<string, number> = {};
			(window as ShownAtWindow).shownAt = shownAt;
			new MutationObserver(() => {
				for (const role of ['status', 'alert']) {
					if (document.querySelector(`[role="${role}"]`)?.textContent && !shownAt[role])
						shownAt[role] = performance.now();
				}
			}).observe(document, { subtree: true, childList: true, characterData: true });
		});
		await gotoUpload(page);

		await uploadFileWithoutTargetYear(page);
		await expect(page.getByRole('alert')).not.toBeEmpty();

		const { status, alert } = await page.evaluate(() => (window as ShownAtWindow).shownAt ?? {});
		// Timers never fire early, so only DOM update jitter can shave a little off.
		expect(alert - status).toBeGreaterThanOrEqual(MIN_UPLOAD_LOADING_MS - 50);
	});

	test('explains why an export without target year activities was rejected', async ({ page }) => {
		await gotoUpload(page);

		await uploadFileWithoutTargetYear(page);

		await expect(page.getByRole('button', { name: WRONG_YEAR_MESSAGE })).toBeVisible({
			timeout: 10000
		});
		await expect(page.getByText('Click to try again')).toBeVisible();
	});

	test('says how many rows could not be read and why', async ({ page }) => {
		const rows = ['not a date', 'March 32nd', ''].map(
			(date) => `Running,${date},false,Morning Run,10.0,600,00:50:00,100`
		);
		await gotoUpload(page);

		await uploadFile(page, [garminCsv([]), ...rows].join('\n'));

		await expect(page.getByRole('alert')).toHaveText(
			'3 rows could not be read, e.g. row 2: the date is not valid',
			{ timeout: 10000 }
		);
	});

	test('notes the skipped rows above a dashboard that loaded', async ({ page }) => {
		const csv = garminCsv([{ title: 'Morning Run' }, { title: 'Evening Run' }]);

		await uploadCsv(page, `${csv}\nRunning,not a date,false,Lunch Run,5.0,300,00:25:00,10`);

		await expect(page.getByText('Skipped 1 row that could not be read')).toBeVisible();
	});

	test('ignores a file dropped outside the upload zone', async ({ page }) => {
		await gotoUpload(page);
		const heading = page.getByRole('heading', { name: 'ActiveYear' });

		expect(await isFileDragCancelled(heading, 'dragover')).toBe(true);
		expect(await isFileDragCancelled(heading, 'drop')).toBe(true);

		await expect(page.getByText('Drop your Garmin CSV here')).toBeVisible();
		await expect(page.getByRole('status')).toBeEmpty();
	});

	test('shows no drop highlight while a file loads', async ({ page }) => {
		await slowFileReads(page);
		await gotoUpload(page);
		await uploadFileWithoutTargetYear(page);
		await expectFileReadSlowed(page);
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
		await gotoUpload(page);
		await uploadZone(page).focus();

		const fileChooser = page.waitForEvent('filechooser');
		await page.keyboard.press('Space');

		await fileChooser;
	});

	test('announces loading progress and errors', async ({ page }) => {
		await slowFileReads(page);
		await gotoUpload(page);
		await uploadFileWithoutTargetYear(page);
		await expectFileReadSlowed(page);

		await expect(page.getByRole('status')).toHaveText('Analyzing activities...');
		await expect(page.getByRole('alert')).toHaveText(WRONG_YEAR_MESSAGE, { timeout: 10000 });
	});

	test('blocks the demo while a file loads', async ({ page }) => {
		await slowFileReads(page);
		await gotoUpload(page);
		await uploadFileWithoutTargetYear(page);
		await expectFileReadSlowed(page);

		await expect(demoButton(page)).toBeDisabled();
		await expect(page.getByRole('alert')).not.toBeEmpty({ timeout: 10000 });
		await expect(demoButton(page)).toBeEnabled();
	});

	test('accepts the same file again after an error', async ({ page }) => {
		await gotoUpload(page);
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
