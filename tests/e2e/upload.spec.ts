import { test, expect, type Locator, type Page } from '@playwright/test';
import { MIN_UPLOAD_LOADING_MS, TARGET_YEAR } from '../../src/lib/constants/time.js';
import { UPLOAD_ZONE_ID } from '../../src/lib/constants/dom.js';
import {
	DASHBOARD_HEADING,
	SAMPLE_CSV,
	STRAVA_CSV,
	garminCsv,
	gotoUpload,
	showSlide,
	uploadCsv,
	uploadSample
} from './helpers.js';

const WRONG_YEAR_MESSAGE = `This file has activities from ${TARGET_YEAR - 1}, none from ${TARGET_YEAR}. Export your activities again to include ${TARGET_YEAR}.`;

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
		const read = File.prototype.arrayBuffer;
		File.prototype.arrayBuffer = function () {
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
	test('imports Garmin imperial distances', async ({ page }) => {
		await gotoUpload(page);
		const group = page.getByRole('group', { name: 'Units in your Garmin account' });
		await expect(group.getByRole('button', { name: 'Metric', exact: true })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await group.getByRole('button', { name: 'Imperial' }).click();
		await uploadFile(
			page,
			`Activity Type,Date,Title,Distance\nRunning,${TARGET_YEAR}-03-01 08:00:00,Run,6.21`
		);
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
		await expect(page.getByTestId('main-stats').getByText('6.2mi')).toBeVisible();
		await page
			.getByRole('group', { name: 'Distance unit' })
			.getByRole('button', { name: 'km' })
			.click();
		await expect(page.getByTestId('main-stats').getByText('10.0km')).toBeVisible();
	});

	test.describe('in a US browser', () => {
		test.use({ locale: 'en-US' });

		test('still starts on Metric', async ({ page }) => {
			await gotoUpload(page);
			const group = page.getByRole('group', { name: 'Units in your Garmin account' });
			await expect(group.getByRole('button', { name: 'Metric' })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
			await page.getByRole('button', { name: /demo data/i }).click();
			const units = page.getByRole('group', { name: 'Distance unit' });
			await expect(units.getByRole('button', { name: 'km' })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
		});
	});

	test('loads a file dropped on the dashboard', async ({ page }) => {
		await uploadCsv(page, garminCsv([{ title: 'Morning Run' }]));
		await expect(page.getByText(/1\s+activity across/)).toBeVisible();

		const cancelled = await page.locator('main').evaluate(
			(main, csv) => {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(new File([csv], 'activities.csv', { type: 'text/csv' }));
				const event = new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true });
				main.dispatchEvent(event);
				return event.defaultPrevented;
			},
			garminCsv([{ title: 'Morning Run' }, { title: 'Evening Run' }])
		);

		expect(cancelled).toBe(true);
		await expect(page.getByText(/2\s+activities across/)).toBeVisible();
	});

	test('home page displays upload UI', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'ActiveYear' })).toBeVisible();
		await expect(page.getByText(`${DASHBOARD_HEADING} in Sport`)).toBeVisible();

		await expect(page.getByText('Drop your Garmin or Strava CSV here')).toBeVisible();
		await expect(page.getByText('Your data never leaves this browser')).toBeVisible();
	});

	test('shows instructions for getting data', async ({ page }) => {
		await gotoUpload(page);

		await expect(page.getByText('How to get your data')).toBeVisible();
		await expect(page.getByText('connect.garmin.com')).toBeVisible();
		await expect(
			page.getByText(/Use the website on a computer: the app can't export\./)
		).toBeVisible();
		await expect(
			page.getByText(`Scroll down until all ${TARGET_YEAR} activities are loaded`)
		).toBeVisible();
		const garminTab = page.getByRole('tab', { name: 'Garmin Connect' });
		const stravaTab = page.getByRole('tab', { name: 'Strava' });
		await expect(garminTab).toHaveAttribute('aria-selected', 'true');
		await stravaTab.click();
		await expect(page.getByText('Download or Delete Your Account').first()).toBeVisible();
		await expect(page.getByText(/usually arrives within a few hours/)).toBeVisible();
		await expect(
			page.getByText(/Use the website on a computer: the app can't export\./)
		).toBeHidden();
		await garminTab.click();
		await garminTab.focus();
		await page.keyboard.press('ArrowRight');
		await expect(stravaTab).toHaveAttribute('aria-selected', 'true');
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
		const highlights = page.locator('section').filter({
			has: page.getByRole('heading', { name: 'Highlights', exact: true })
		});
		const caption = page.getByText('Your longest sessions of the year.');
		await expect(highlights.getByTestId('highlight-row').first()).toBeVisible();
		await expect(caption).toBeVisible();

		await page.getByRole('button', { name: 'Upload different file' }).click();
		await page.getByRole('button', { name: 'See how it works with demo data' }).click();
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	});

	test('imports a Spanish Garmin export', async ({ page }) => {
		await gotoUpload(page);
		await uploadFile(
			page,
			`Tipo de actividad,Fecha,Título,Distancia,Calorías,Tiempo,Ascenso total\nCarrera,${TARGET_YEAR}-03-01 08:00:00,Carrera,10.00,500,01:00:00,100\nEntrenamiento en cinta,${TARGET_YEAR}-03-02 08:00:00,Cinta,5.00,250,00:30:00,0`
		);
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
		await expect(page.getByTestId('main-stats').getByText('15.0km')).toBeVisible();
	});

	test('imports a French Strava export', async ({ page }) => {
		await gotoUpload(page);
		await uploadFile(
			page,
			`Date de l'activité,Nom de l'activité,Type d'activité,Distance,Durée de déplacement\n1 mars ${TARGET_YEAR} 08:00:00,Course,Course à pied,10,3600`
		);
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible();
	});

	test('shows Strava highlights on the export card', async ({ page }) => {
		await gotoUpload(page);
		await page.locator('input[type="file"]').setInputFiles(STRAVA_CSV);
		await expect(page.getByRole('heading', { name: DASHBOARD_HEADING })).toBeVisible({
			timeout: 10000
		});
		await expect(page.locator('body')).not.toContainText(/Garmin/i);

		await showSlide(page, 2);
		const card = page.locator('#export-card');
		await expect(card.locator('.highlight-title').first()).toBeVisible();
		await expect(card).not.toContainText('No highlight activities yet');
		await expect(page.locator('body')).not.toContainText(/Garmin/i);
	});

	test('rejects an unsupported Strava language', async ({ page }) => {
		await gotoUpload(page);
		await uploadFile(page, '日付,種目,ファイル\n2026-10-31,ランニング,activities/123.fit.gz');
		await expect(page.getByRole('alert')).toContainText(
			"This Strava export is in a language we can't read yet",
			{ timeout: 10000 }
		);
	});

	test('allows uploading a different file', async ({ page }) => {
		await uploadSample(page);

		await page.getByRole('button', { name: 'Upload different file' }).click();

		await expect(page.getByText('Drop your Garmin or Strava CSV here')).toBeVisible();
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
			'3 rows could not be read, e.g. row 2: the date is not valid.',
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

		await expect(page.getByText('Drop your Garmin or Strava CSV here')).toBeVisible();
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
		page.getByRole('button', { name: /Drop your Garmin or Strava CSV here/ });
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

	test('moves focus to the dashboard heading without a focus ring after a keyboard upload', async ({
		page
	}) => {
		await gotoUpload(page);
		await uploadZone(page).focus();
		const fileChooser = page.waitForEvent('filechooser');
		await page.keyboard.press('Space');
		await (await fileChooser).setFiles(SAMPLE_CSV);

		const heading = page.getByRole('heading', { name: DASHBOARD_HEADING });
		await expect(heading).toBeFocused({ timeout: 10000 });
		await expect(heading).toHaveCSS('outline-style', 'none');
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

test('warns when a Garmin export may be cut short', async ({ page }) => {
	const csv = garminCsv(Array.from({ length: 20 }, (_, i) => ({ title: `Run ${i}` })));
	await uploadCsv(page, csv);
	const warning = page.getByText(
		'Your export starts on March 1. If your year started earlier, scroll to the bottom of All Activities in Garmin Connect and export again.'
	);
	await expect(warning).toBeVisible();
	await uploadCsv(page, csv.replace(`${TARGET_YEAR}-03-20`, `${TARGET_YEAR - 1}-12-31`));
	await expect(warning).toHaveCount(0);
});
