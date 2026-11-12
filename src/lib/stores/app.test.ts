import { describe, it, expect, beforeEach } from 'vitest';
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
		appStore.reset();
		appStore.unit = 'km';
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
		expect(appStore.error).toBe('Please upload a CSV file');
	});

	it('rejects a CSV in a format no parser recognises', async () => {
		await appStore.processFile(new File(['name,score\nAna,3'], 'scores.csv'));

		expect(appStore.status).toBe('error');
		expect(appStore.error).toContain("couldn't recognise this file");
	});

	it.each([
		['the error message', new Error('Disk read failed'), 'Disk read failed'],
		['a generic message', 'not an Error', 'Failed to parse file']
	])('shows %s when reading the file fails', async (_, failure, message) => {
		const file = csvFile('');
		file.text = () => Promise.reject(failure);

		await appStore.processFile(file);

		expect(appStore.status).toBe('error');
		expect(appStore.error).toBe(message);
	});

	it('loads the target year activities from a Garmin export', async () => {
		await appStore.processFile(csvFile(garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)));

		expect(appStore.status).toBe('ready');
		expect(appStore.error).toBeNull();
		expect(appStore.activities).toEqual([
			expect.objectContaining({ type: 'running', title: 'Run', distance: 10 })
		]);
		expect(appStore.stats?.activityCount).toBe(1);
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
		expect(appStore.highlights).toEqual(demoActivities.filter((a) => a.favorite));
		expect(appStore.highlights.length).toBeGreaterThan(0);
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
