import { describe, it, expect, beforeEach } from 'vitest';
import { appStore } from './app.svelte.js';
import { TARGET_YEAR } from '../constants/time.js';
import { demoStats, demoHighlights } from '../data/demo.js';

describe('appStore', () => {
    beforeEach(() => {
        appStore.reset();
    });

    it('starts idle with empty results', () => {
        expect(appStore.status).toBe('idle');
        expect(appStore.activities).toEqual([]);
        expect(appStore.stats).toBeNull();
        expect(appStore.weeklyPattern).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(appStore.selectedYear).toBe(TARGET_YEAR);
    });

    it('rejects a file that is not a CSV', async () => {
        await appStore.processFile(new File(['x'], 'activities.txt'));

        expect(appStore.status).toBe('error');
        expect(appStore.error).toBe('Please upload a CSV file');
    });

    it('loads demo data and derives highlights from favorite activities', () => {
        appStore.loadDemoData();

        expect(appStore.status).toBe('ready');
        expect(appStore.stats).toEqual(demoStats);
        expect(appStore.highlights).toEqual(demoHighlights.filter((a) => a.favorite));
        expect(appStore.highlights.length).toBeGreaterThan(0);
    });

    it('reset clears results and the profile picture but keeps export preferences', () => {
        appStore.loadDemoData();
        appStore.userPfp = 'data:image/png;base64,x';
        appStore.userName = 'Ana';
        appStore.theme = 'retro';

        appStore.reset();

        expect(appStore.status).toBe('idle');
        expect(appStore.highlights).toEqual([]);
        expect(appStore.userPfp).toBeNull();
        expect(appStore.userName).toBe('Ana');
        expect(appStore.theme).toBe('retro');
    });

    it('exposes writable preferences', () => {
        appStore.confettiEnabled = true;
        appStore.breakdownMetric = 'duration';
        appStore.summaryMetric = 'duration';
        appStore.unit = 'miles';
        appStore.selectedYear = TARGET_YEAR - 1;

        expect(appStore.confettiEnabled).toBe(true);
        expect(appStore.breakdownMetric).toBe('duration');
        expect(appStore.summaryMetric).toBe('duration');
        expect(appStore.unit).toBe('miles');
        expect(appStore.selectedYear).toBe(TARGET_YEAR - 1);
    });
});
