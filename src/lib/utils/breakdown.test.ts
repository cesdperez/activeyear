import { describe, it, expect } from 'vitest';
import {
    rankSports,
    selectTopSports,
    sportDonutSegments,
    weeklyBars,
    activeDaysPercent,
} from './breakdown.js';
import type { SportBreakdown, WeeklyPattern } from '#lib/types/index.js';

const sport = (overrides: Partial<SportBreakdown>): SportBreakdown => ({
    type: 'running',
    distance: 0,
    duration: 7200,
    count: 1,
    ...overrides,
});

describe('rankSports', () => {
    it('ranks every consolidated sport by the chosen metric without a limit', () => {
        const breakdown = [
            sport({ type: 'running', count: 5 }),
            sport({ type: 'cycling', count: 9 }),
            sport({ type: 'swimming', count: 3 }),
            sport({ type: 'hiking', count: 7 }),
            sport({ type: 'yoga', count: 1 }),
        ];

        expect(rankSports(breakdown, 'count').map((s) => s.type)).toEqual([
            'cycling',
            'hiking',
            'running',
            'swimming',
            'yoga',
        ]);
    });
});

describe('selectTopSports', () => {
    it('ranks sports by the chosen metric and keeps the top four', () => {
        const breakdown = [
            sport({ type: 'running', count: 5, duration: 36000 }),
            sport({ type: 'cycling', count: 9, duration: 7200 }),
            sport({ type: 'swimming', count: 3, duration: 90000 }),
            sport({ type: 'hiking', count: 7, duration: 10800 }),
            sport({ type: 'yoga', count: 1, duration: 3600 }),
        ];

        expect(selectTopSports(breakdown, 'count').map((s) => s.type)).toEqual([
            'cycling',
            'hiking',
            'running',
            'swimming',
        ]);
        expect(selectTopSports(breakdown, 'duration').map((s) => s.type)).toEqual([
            'swimming',
            'running',
            'hiking',
            'cycling',
        ]);
    });

    it('folds sports under one hour into "other" before ranking', () => {
        const breakdown = [
            sport({ type: 'running', count: 2 }),
            sport({ type: 'yoga', count: 4, duration: 1800 }),
            sport({ type: 'walking', count: 3, duration: 1200 }),
        ];

        expect(selectTopSports(breakdown, 'count')).toEqual([
            { type: 'other', distance: 0, duration: 3000, count: 7 },
            sport({ type: 'running', count: 2 }),
        ]);
    });

    it('returns an empty list for no data', () => {
        expect(selectTopSports([], 'count')).toEqual([]);
    });
});

describe('sportDonutSegments', () => {
    it('splits the circumference by activity count with a 4 unit gap', () => {
        const segments = sportDonutSegments(
            [sport({ count: 3 }), sport({ count: 1 })],
            100,
        );

        expect(segments).toEqual([
            { dashArray: '71 100', offset: 0 },
            { dashArray: '21 100', offset: 75 },
        ]);
    });
});

describe('weeklyBars', () => {
    it('scales bars to the busiest day and flags the two busiest days', () => {
        const pattern: WeeklyPattern = [10, 5, 0, 20, 10, 1, 0];

        const bars = weeklyBars(pattern, 100);

        expect(bars.map((b) => b.heightPercent)).toEqual([50, 25, 0, 100, 50, 5, 0]);
        expect(bars.map((b) => b.barHeight)).toEqual([50, 25, 8, 100, 50, 8, 8]);
        expect(bars.map((b) => b.isTopDay)).toEqual([
            true, false, false, true, false, false, false,
        ]);
    });
});

describe('activeDaysPercent', () => {
    it('is the share of the year with activity, capped at 100', () => {
        expect(activeDaysPercent(73)).toBe(20);
        expect(activeDaysPercent(400)).toBe(100);
    });
});
