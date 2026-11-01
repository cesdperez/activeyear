import { describe, it, expect, beforeEach } from 'vitest';
import { appStore } from './app.svelte.js';
import { demoActivities } from '../data/demo.js';
import { calculateYearStats } from '../utils/stats.js';

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

	it('derives stats and highlights from the demo activities', () => {
		appStore.loadDemoData();

		expect(appStore.status).toBe('ready');
		expect(appStore.stats).toEqual(calculateYearStats(demoActivities));
		expect(appStore.highlights).toEqual(demoActivities.filter((a) => a.favorite));
		expect(appStore.highlights.length).toBeGreaterThan(0);
	});

	it('derives records, breakdown and weekly pattern from the demo activities', () => {
		appStore.loadDemoData();

		expect(appStore.records?.longestDistance?.activity.title).toBe('Century Ride Achievement');
		expect(appStore.breakdown.reduce((sum, s) => sum + s.count, 0)).toBe(245);
		expect(appStore.weeklyPattern.reduce((sum, n) => sum + n, 0)).toBe(245);
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
