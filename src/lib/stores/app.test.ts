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
