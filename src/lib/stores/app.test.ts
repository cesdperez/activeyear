import { presetHighlights } from '#lib/utils/highlights.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { track } from '#lib/analytics/track.js';

vi.mock('#lib/analytics/track.js', () => ({ track: vi.fn() }));
import { appStore } from './app.svelte.js';
import { TARGET_YEAR } from '../constants/time.js';
import { demoActivities } from '../data/demo.js';
import {
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern,
	calculateYearStats
} from '../utils/stats.js';

describe('appStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		appStore.reset();
		appStore.unit = 'km';
	});

	it('preserves the lightmile theme on reset', () => {
		appStore.theme = 'lightmile';
		appStore.reset();
		expect(appStore.theme).toBe('lightmile');
		appStore.theme = 'neon';
	});

	it('starts idle with empty results', () => {
		expect(appStore.status).toBe('idle');
		expect(appStore.activities).toEqual([]);
		expect(appStore.stats).toBeNull();
		expect(appStore.weeklyPattern).toEqual([0, 0, 0, 0, 0, 0, 0]);
	});

	it('rejects a file that is not a CSV', async () => {
		await appStore.processFile(new File(['x'], 'activities.txt'));

		expect(appStore.status).toBe('error');
		expect(appStore.error).toEqual({ type: 'invalid-extension' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'unsupported-file-type');
	});

	it('loads a saved JSON year', async () => {
		await appStore.processFile(csvFile(garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)));
		const activities = appStore.activities;
		const json = appStore.savedYearJson();
		appStore.reset();
		await appStore.processFile(new File([json], 'year.JSON'));
		expect(appStore.status).toBe('ready');
		expect(appStore.activities).toEqual(activities);
		expect(appStore.source).toBe('garmin');
		expect(appStore.parseErrors).toEqual([]);
	});

	it('rejects invalid saved JSON', async () => {
		await appStore.processFile(new File(['{'], 'year.json'));
		expect(appStore.status).toBe('error');
		expect(appStore.error).toEqual({ type: 'invalid-file' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'invalid-saved-year');
	});

	it('rejects a CSV in a format no parser recognises', async () => {
		await appStore.processFile(new File(['name,score\nAna,3'], 'scores.csv'));

		expect(appStore.status).toBe('error');
		expect(appStore.error).toEqual({ type: 'unrecognised' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'unsupported-format');
	});

	it.each([
		['an error', new Error('Disk read failed')],
		['a non-error rejection', 'not an Error']
	])('shows %s when reading the file fails', async (_, failure) => {
		const file = csvFile('');
		file.text = () => Promise.reject(failure);

		await appStore.processFile(file);

		expect(appStore.status).toBe('error');
		expect(appStore.error).toEqual({ type: 'unknown-failure' });
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', 'read-failed');
	});

	it.each([
		[garminCsv('bad'), 'rows-rejected'],
		[garminCsv(`${TARGET_YEAR - 1}-03-01 08:00:00`), 'no-activities-in-year']
	])('tracks unusable CSV files', async (csv, type) => {
		await appStore.processFile(csvFile(csv));
		expect(track).toHaveBeenCalledExactlyOnceWith('upload_error', type);
	});

	it('loads the target year activities from a Garmin export', async () => {
		await appStore.processFile(csvFile(garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)));

		expect(appStore.status).toBe('ready');
		expect(appStore.error).toBeNull();
		expect(appStore.activities).toEqual([
			expect.objectContaining({ type: 'running', title: 'Run', distance: 10 })
		]);
		expect(appStore.stats?.activityCount).toBe(1);
		expect(track).toHaveBeenCalledTimes(2);
		expect(track).toHaveBeenCalledWith('upload_success', '1-10');
		expect(track).toHaveBeenCalledWith('sports_count', '1');
	});

	it('counts the rows left out of a file that loads', async () => {
		const content = `${garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)}\nRunning,bad,Run,10.0,600,00:50:00,100`;

		await appStore.processFile(csvFile(content));

		expect(appStore.status).toBe('ready');
		expect(appStore.skippedRowCount).toBe(1);
	});

	it('reports no skipped rows for the demo', () => {
		appStore.loadDemoData();

		expect(appStore.skippedRowCount).toBe(0);
		expect(track).not.toHaveBeenCalled();
	});

	it('accepts a CSV extension in any case', async () => {
		const content = garminCsv(`${TARGET_YEAR}-03-01 08:00:00`);

		await appStore.processFile(new File([content], 'Activities.CSV'));

		expect(appStore.status).toBe('ready');
	});

	it('lists highlights by date whatever the row order of the file', async () => {
		const csv = [
			'Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent',
			`Running,${TARGET_YEAR}-09-01 08:00:00,true,September,10.0,600,00:50:00,100`,
			`Running,${TARGET_YEAR}-02-01 08:00:00,true,February,10.0,600,00:50:00,100`,
			`Running,${TARGET_YEAR}-05-01 08:00:00,true,May,10.0,600,00:50:00,100`
		].join('\n');

		await appStore.processFile(csvFile(csv));

		expect(appStore.highlights.map((a) => a.title)).toEqual(['February', 'May', 'September']);
	});

	it('derives stats and highlights from the demo activities', () => {
		appStore.loadDemoData();

		expect(appStore.status).toBe('ready');
		expect(appStore.stats).toEqual(calculateYearStats(demoActivities));
		expect(appStore.highlights).toEqual(presetHighlights(demoActivities, 'longest'));
		expect(appStore.highlights.length).toBeGreaterThan(0);
	});

	it('edits highlights, enforces the cap and resets on load', () => {
		appStore.loadDemoData();
		expect(appStore.highlightPreset).toBe('longest');
		expect(appStore.canAddHighlight).toBe(false);
		const original = appStore.highlights[0];
		const other = appStore.activities.find((activity) => !appStore.isHighlight(activity))!;
		appStore.addHighlight(other);
		expect(appStore.isHighlight(other)).toBe(false);
		appStore.removeHighlight(original);
		expect(appStore.highlightPreset).toBe('custom');
		expect(appStore.canAddHighlight).toBe(true);
		appStore.addHighlight(other);
		appStore.addHighlight(other);
		expect(appStore.highlights).toHaveLength(10);
		expect(appStore.isHighlight(other)).toBe(true);
		expect(appStore.highlights).toEqual(
			[...appStore.highlights].sort((a, b) => a.date.getTime() - b.date.getTime())
		);
		appStore.applyHighlightPreset('favorites');
		expect(appStore.highlightPreset).toBe('favorites');
		expect(appStore.highlights).toEqual(presetHighlights(appStore.activities, 'favorites'));
		expect(appStore.highlightPresets).toContain('longest');
		expect(appStore.searchActivities(other.title)).toContain(other);
		appStore.loadDemoData();
		expect(appStore.highlightPreset).toBe('longest');
		expect(appStore.highlights).toEqual(presetHighlights(demoActivities, 'longest'));
		appStore.reset();
		expect(appStore.highlights).toEqual([]);
		expect(appStore.highlightPreset).toBe('longest');
	});

	it('derives records, breakdown and weekly pattern from the demo activities', () => {
		appStore.loadDemoData();

		expect(appStore.records).toEqual(calculatePersonalRecords(demoActivities));
		expect(appStore.breakdown).toEqual(calculateSportBreakdown(demoActivities));
		expect(appStore.weeklyPattern).toEqual(calculateWeeklyPattern(demoActivities));
	});

	it('focuses the summary on the first stat with a value when the data loads', async () => {
		appStore.summaryMetric = 'distance';

		await appStore.processFile(
			csvFile(
				`Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nYoga,${TARGET_YEAR}-03-01 08:00:00,Yoga,0.0,200,01:00:00,0`
			)
		);

		expect(appStore.summaryMetric).toBe('duration');
	});

	it('moves the focused stat off a value that shows as zero in the new unit', async () => {
		await appStore.processFile(
			csvFile(
				`Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,${TARGET_YEAR}-03-01 08:00:00,Run,5.0,200,00:30:00,6`
			)
		);
		appStore.summaryMetric = 'elevation';

		appStore.unit = 'miles';

		expect(appStore.summaryMetric).toBe('distance');
	});

	it('keeps the focused stat when the loaded data has a value for it', () => {
		appStore.summaryMetric = 'calories';

		appStore.loadDemoData();

		expect(appStore.summaryMetric).toBe('calories');
	});

	it.each([
		['  Ana  ', 'Ana'],
		['   ', '']
	])('shows the name %j as %j', (name, shown) => {
		appStore.userName = name;

		expect(appStore.displayName).toBe(shown);
	});

	it('reset clears results and the profile picture but keeps export preferences', () => {
		appStore.loadDemoData();
		appStore.userPfp = 'data:image/png;base64,x';
		appStore.userName = 'Ana';
		appStore.theme = 'retro';

		appStore.reset();

		expect(appStore.status).toBe('idle');
		expect(appStore.stats).toBeNull();
		expect(appStore.records).toBeNull();
		expect(appStore.breakdown).toEqual([]);
		expect(appStore.weeklyPattern).toEqual([0, 0, 0, 0, 0, 0, 0]);
		expect(appStore.highlights).toEqual([]);
		expect(appStore.userPfp).toBeNull();
		expect(appStore.userName).toBe('Ana');
		expect(appStore.theme).toBe('retro');
	});
});

function csvFile(content: string): File {
	return new File([content], 'activities.csv');
}

function garminCsv(date: string): string {
	return `Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,${date},Run,10.0,600,00:50:00,100`;
}
