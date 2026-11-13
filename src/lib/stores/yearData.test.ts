import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadStore } from './upload.svelte.js';
import { exportSettings } from './exportSettings.svelte.js';
import { yearData } from './yearData.svelte.js';
import { highlightsStore } from './highlights.svelte.js';
import { presetHighlights } from '#lib/utils/highlights.js';
import { TARGET_YEAR } from '../constants/time.js';
import { demoYear } from '../data/demo.js';
import {
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern,
	calculateYearStats
} from '../utils/stats.js';
vi.mock('#lib/analytics/track.js', () => ({ track: vi.fn() }));
describe('yearData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uploadStore.reset();
		exportSettings.unit = 'km';
	});
	it('captures year progress on CSV and saved year loads, and counts the demo up to today', async () => {
		vi.useFakeTimers();
		try {
			vi.setSystemTime(new Date(TARGET_YEAR, 5, 30));
			await uploadStore.processFile(csvFile(garminCsv(`${TARGET_YEAR}-03-01 08:00:00`)));
			expect(yearData.yearSoFar).toBe(true);
			expect(yearData.daysCounted).toBe(181);
			const json = yearData.savedYearJson();
			vi.setSystemTime(new Date(TARGET_YEAR + 1, 0, 15));
			await uploadStore.processFile(new File([json], 'year.json'));
			expect(yearData.yearSoFar).toBe(false);
			expect(yearData.daysCounted).toBe(365);
			vi.setSystemTime(new Date(TARGET_YEAR, 5, 30));
			uploadStore.loadDemoData();
			expect(yearData.yearSoFar).toBe(true);
			expect(yearData.daysCounted).toBe(181);
			uploadStore.reset();
			expect(yearData.yearSoFar).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('derives stats and highlights from the demo activities', () => {
		uploadStore.loadDemoData();
		const demoActivities = demoYear(new Date()).activities;

		expect(uploadStore.status).toBe('ready');
		expect(yearData.stats).toEqual(calculateYearStats(demoActivities));
		expect(highlightsStore.highlights).toEqual(presetHighlights(demoActivities, 'longest'));
		expect(highlightsStore.highlights.length).toBeGreaterThan(0);
	});

	it('derives records, breakdown and weekly pattern from the demo activities', () => {
		uploadStore.loadDemoData();
		const demoActivities = demoYear(new Date()).activities;

		expect(yearData.records).toEqual(calculatePersonalRecords(demoActivities));
		expect(yearData.breakdown).toEqual(calculateSportBreakdown(demoActivities));
		expect(yearData.weeklyPattern).toEqual(calculateWeeklyPattern(demoActivities));
	});
});

function csvFile(content: string): File {
	return new File([content], 'activities.csv');
}

function garminCsv(date: string): string {
	return `Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,${date},Run,10.0,600,00:50:00,100`;
}
