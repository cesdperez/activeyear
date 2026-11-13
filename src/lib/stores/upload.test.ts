import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadStore } from './upload.svelte.js';
import { exportSettings } from './exportSettings.svelte.js';
import { yearData } from './yearData.svelte.js';
import { highlightsStore } from './highlights.svelte.js';
import { track } from '#lib/analytics/track.js';
import { TARGET_YEAR } from '../constants/time.js';
vi.mock('#lib/analytics/track.js', () => ({ track: vi.fn() }));
describe('upload', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uploadStore.reset();
		exportSettings.unit = 'km';
	});

	it('preserves the lightmile theme on reset', () => {
		exportSettings.theme = 'lightmile';
		uploadStore.reset();
		expect(exportSettings.theme).toBe('lightmile');
		exportSettings.theme = 'neon';
	});

	it('starts idle with empty results', () => {
		expect(uploadStore.status).toBe('idle');
		expect(yearData.activities).toEqual([]);
		expect(yearData.stats).toBeNull();
		expect(yearData.weeklyPattern).toEqual([0, 0, 0, 0, 0, 0, 0]);
	});

	it('rejects a file that is not a CSV', async () => {
		await uploadStore.processFile(new File(['x'], 'activities.txt'));

		expect(uploadStore.status).toBe('error');
		expect(uploadStore.error).toEqual({ type: 'invalid-extension' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'unsupported-file-type');
	});

	it('loads a saved JSON year', async () => {
		await uploadStore.processFile(csvFile(garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)));
		const activities = yearData.activities;
		const json = yearData.savedYearJson();
		uploadStore.reset();
		await uploadStore.processFile(new File([json], 'year.JSON'));
		expect(uploadStore.status).toBe('ready');
		expect(yearData.activities).toEqual(activities);
		expect(yearData.source).toBe('garmin');
		expect(uploadStore.parseErrors).toEqual([]);
	});

	it('rejects invalid saved JSON', async () => {
		await uploadStore.processFile(new File(['{'], 'year.json'));
		expect(uploadStore.status).toBe('error');
		expect(uploadStore.error).toEqual({ type: 'invalid-file' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'invalid-saved-year');
	});

	it('rejects a CSV in a format no parser recognises', async () => {
		await uploadStore.processFile(new File(['name,score\nAna,3'], 'scores.csv'));

		expect(uploadStore.status).toBe('error');
		expect(uploadStore.error).toEqual({ type: 'unrecognised' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'unsupported-format');
	});

	it.each([
		['an error', new Error('Disk read failed')],
		['a non-error rejection', 'not an Error']
	])('shows %s when reading the file fails', async (_, failure) => {
		const file = csvFile('');
		file.text = () => Promise.reject(failure);

		await uploadStore.processFile(file);

		expect(uploadStore.status).toBe('error');
		expect(uploadStore.error).toEqual({ type: 'unknown-failure' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'read-failed');
	});

	it.each([
		[garminCsv('bad'), 'rows-rejected'],
		[garminCsv(`${TARGET_YEAR - 1}-03-01 08:00:00`), 'no-activities-in-year']
	])('tracks unusable CSV files', async (csv, type) => {
		await uploadStore.processFile(csvFile(csv));
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', type);
	});

	it('loads the target year activities from a Garmin export', async () => {
		await uploadStore.processFile(csvFile(garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)));

		expect(uploadStore.status).toBe('ready');
		expect(uploadStore.error).toBeNull();
		expect(yearData.activities).toEqual([
			expect.objectContaining({ type: 'running', title: 'Run', distance: 10 })
		]);
		expect(yearData.stats?.activityCount).toBe(1);
		expect(track).toHaveBeenCalledTimes(2);
		expect(track).toHaveBeenCalledWith('upload_success', '1-10');
		expect(track).toHaveBeenCalledWith('sports_count', '1');
	});

	it('counts the rows left out of a file that loads', async () => {
		const content = `${garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)}\nRunning,bad,Run,10.0,600,00:50:00,100`;

		await uploadStore.processFile(csvFile(content));

		expect(uploadStore.status).toBe('ready');
		expect(uploadStore.skippedRowCount).toBe(1);
	});

	it('reports no skipped rows for the demo', () => {
		uploadStore.loadDemoData();

		expect(uploadStore.skippedRowCount).toBe(0);
		expect(track).not.toHaveBeenCalled();
	});

	it('reset clears results and the profile picture but keeps export preferences', () => {
		uploadStore.loadDemoData();
		exportSettings.userPfp = 'data:image/png;base64,x';
		exportSettings.userName = 'Ana';
		exportSettings.theme = 'retro';

		uploadStore.reset();

		expect(uploadStore.status).toBe('idle');
		expect(yearData.stats).toBeNull();
		expect(yearData.records).toBeNull();
		expect(yearData.breakdown).toEqual([]);
		expect(yearData.weeklyPattern).toEqual([0, 0, 0, 0, 0, 0, 0]);
		expect(highlightsStore.highlights).toEqual([]);
		expect(exportSettings.userPfp).toBeNull();
		expect(exportSettings.userName).toBe('Ana');
		expect(exportSettings.theme).toBe('retro');
	});
});

function csvFile(content: string): File {
	return new File([content], 'activities.csv');
}

function garminCsv(date: string): string {
	return `Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,${date},Run,10.0,600,00:50:00,100`;
}
