import { describe, it, expect } from 'vitest';
import {
    calculateYearStats,
    calculateLongestStreak,
    calculatePersonalRecords,
    calculateSportBreakdown,
    calculateWeeklyPattern
} from './stats.js';
import type { Activity } from '../types/index.js';

const createActivity = (overrides: Partial<Activity> = {}): Activity => ({
    date: new Date('2025-06-15'),
    type: 'running',
    title: 'Test Run',
    distance: 10,
    duration: 3600,
    calories: 500,
    elevation: 100,
    ...overrides
});

describe('calculateYearStats', () => {
    it('returns zeros for empty activities', () => {
        const stats = calculateYearStats([]);

        expect(stats.totalDistance).toBe(0);
        expect(stats.totalDuration).toBe(0);
        expect(stats.totalCalories).toBe(0);
        expect(stats.totalElevation).toBe(0);
        expect(stats.activeDays).toBe(0);
        expect(stats.longestStreak).toBe(0);
        expect(stats.activityCount).toBe(0);
    });

    it('calculates totals correctly', () => {
        const activities = [
            createActivity({ distance: 10, duration: 3600, calories: 500, elevation: 100 }),
            createActivity({ distance: 5, duration: 1800, calories: 250, elevation: 50 })
        ];

        const stats = calculateYearStats(activities);

        expect(stats.totalDistance).toBe(15);
        expect(stats.totalDuration).toBe(5400);
        expect(stats.totalCalories).toBe(750);
        expect(stats.totalElevation).toBe(150);
        expect(stats.activityCount).toBe(2);
    });

    it('counts unique active days', () => {
        const activities = [
            createActivity({ date: new Date('2025-06-15 10:00:00') }),
            createActivity({ date: new Date('2025-06-15 18:00:00') }), // Same day
            createActivity({ date: new Date('2025-06-16 10:00:00') })
        ];

        const stats = calculateYearStats(activities);

        expect(stats.activeDays).toBe(2);
    });
});

describe('calculateLongestStreak', () => {
    it('returns 0 for empty activities', () => {
        expect(calculateLongestStreak([])).toBe(0);
    });

    it('returns 1 for single activity', () => {
        const activities = [createActivity()];
        expect(calculateLongestStreak(activities)).toBe(1);
    });

    it('calculates streak for consecutive days', () => {
        const activities = [
            createActivity({ date: new Date('2025-06-15') }),
            createActivity({ date: new Date('2025-06-16') }),
            createActivity({ date: new Date('2025-06-17') })
        ];

        expect(calculateLongestStreak(activities)).toBe(3);
    });

    it('handles gaps in streak', () => {
        const activities = [
            createActivity({ date: new Date('2025-06-15') }),
            createActivity({ date: new Date('2025-06-16') }),
            // Gap on 17th
            createActivity({ date: new Date('2025-06-18') }),
            createActivity({ date: new Date('2025-06-19') }),
            createActivity({ date: new Date('2025-06-20') }),
            createActivity({ date: new Date('2025-06-21') })
        ];

        expect(calculateLongestStreak(activities)).toBe(4);
    });

    it('counts multiple activities on same day as one', () => {
        const activities = [
            createActivity({ date: new Date('2025-06-15 10:00:00') }),
            createActivity({ date: new Date('2025-06-15 18:00:00') }),
            createActivity({ date: new Date('2025-06-16 10:00:00') })
        ];

        expect(calculateLongestStreak(activities)).toBe(2);
    });
});

describe('calculatePersonalRecords', () => {
    it('returns null records for empty activities', () => {
        const records = calculatePersonalRecords([]);

        expect(records.longestDistance).toBeNull();
        expect(records.longestDuration).toBeNull();
        expect(records.biggestBurn).toBeNull();
    });

    it('finds longest distance activity', () => {
        const activities = [
            createActivity({ title: 'Short Run', distance: 5 }),
            createActivity({ title: 'Long Run', distance: 42 }),
            createActivity({ title: 'Medium Run', distance: 10 })
        ];

        const records = calculatePersonalRecords(activities);

        expect(records.longestDistance?.value).toBe(42);
        expect(records.longestDistance?.activity.title).toBe('Long Run');
    });

    it('finds longest duration activity', () => {
        const activities = [
            createActivity({ title: 'Quick Run', duration: 1800 }),
            createActivity({ title: 'Marathon', duration: 14400 }),
            createActivity({ title: 'Normal Run', duration: 3600 })
        ];

        const records = calculatePersonalRecords(activities);

        expect(records.longestDuration?.value).toBe(14400);
        expect(records.longestDuration?.activity.title).toBe('Marathon');
    });

    it('finds biggest calorie burn', () => {
        const activities = [
            createActivity({ title: 'Easy Day', calories: 300 }),
            createActivity({ title: 'Big Burn', calories: 2800 }),
            createActivity({ title: 'Normal Day', calories: 500 })
        ];

        const records = calculatePersonalRecords(activities);

        expect(records.biggestBurn?.value).toBe(2800);
        expect(records.biggestBurn?.activity.title).toBe('Big Burn');
    });

    it('handles activities with zero values', () => {
        const activities = [
            createActivity({ title: 'Yoga', distance: 0, duration: 1800, calories: 100 }),
            createActivity({ title: 'Run', distance: 5, duration: 1800, calories: 400 })
        ];

        const records = calculatePersonalRecords(activities);

        // Should only count non-zero distances
        expect(records.longestDistance?.value).toBe(5);
    });
});

describe('calculateSportBreakdown', () => {
    it('returns empty array for empty activities', () => {
        expect(calculateSportBreakdown([])).toHaveLength(0);
    });

    it('groups activities by type', () => {
        const activities = [
            createActivity({ type: 'running', distance: 10, duration: 3600 }),
            createActivity({ type: 'running', distance: 5, duration: 1800 }),
            createActivity({ type: 'cycling', distance: 30, duration: 3600 })
        ];

        const breakdown = calculateSportBreakdown(activities);

        expect(breakdown).toHaveLength(2);

        const running = breakdown.find((b) => b.type === 'running');
        expect(running?.count).toBe(2);
        expect(running?.distance).toBe(15);
        expect(running?.duration).toBe(5400);

        const cycling = breakdown.find((b) => b.type === 'cycling');
        expect(cycling?.count).toBe(1);
        expect(cycling?.distance).toBe(30);
    });

    it('sorts by count descending', () => {
        const activities = [
            createActivity({ type: 'swimming' }),
            createActivity({ type: 'running' }),
            createActivity({ type: 'running' }),
            createActivity({ type: 'running' }),
            createActivity({ type: 'cycling' }),
            createActivity({ type: 'cycling' })
        ];

        const breakdown = calculateSportBreakdown(activities);

        expect(breakdown[0].type).toBe('running');
        expect(breakdown[1].type).toBe('cycling');
        expect(breakdown[2].type).toBe('swimming');
    });
});

describe('calculateWeeklyPattern', () => {
    it('returns zeros for empty activities', () => {
        const pattern = calculateWeeklyPattern([]);

        expect(pattern).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('correctly maps Monday to index 0', () => {
        // 2025-06-16 is a Monday
        const activities = [
            createActivity({ date: new Date('2025-06-16') })
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern).toEqual([1, 0, 0, 0, 0, 0, 0]);
    });

    it('correctly maps Sunday to index 6', () => {
        // 2025-06-15 is a Sunday
        const activities = [
            createActivity({ date: new Date('2025-06-15') })
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern).toEqual([0, 0, 0, 0, 0, 0, 1]);
    });

    it('correctly maps all days of the week', () => {
        // Create activities for a full week starting Monday 2025-06-16
        const activities = [
            createActivity({ date: new Date('2025-06-16') }), // Monday
            createActivity({ date: new Date('2025-06-17') }), // Tuesday
            createActivity({ date: new Date('2025-06-18') }), // Wednesday
            createActivity({ date: new Date('2025-06-19') }), // Thursday
            createActivity({ date: new Date('2025-06-20') }), // Friday
            createActivity({ date: new Date('2025-06-21') }), // Saturday
            createActivity({ date: new Date('2025-06-22') })  // Sunday
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern).toEqual([1, 1, 1, 1, 1, 1, 1]);
    });

    it('counts multiple activities on the same day', () => {
        // 2025-06-16 is a Monday
        const activities = [
            createActivity({ date: new Date('2025-06-16 08:00:00') }),
            createActivity({ date: new Date('2025-06-16 18:00:00') }),
            createActivity({ date: new Date('2025-06-16 20:00:00') })
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern[0]).toBe(3); // Monday has 3 activities
    });

    it('aggregates activities from different weeks on the same day of week', () => {
        // Two Mondays
        const activities = [
            createActivity({ date: new Date('2025-06-16') }), // Monday
            createActivity({ date: new Date('2025-06-23') }), // Next Monday
            createActivity({ date: new Date('2025-06-17') })  // Tuesday
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern[0]).toBe(2); // 2 Mondays
        expect(pattern[1]).toBe(1); // 1 Tuesday
    });

    it('handles Saturday correctly (index 5)', () => {
        // 2025-06-21 is a Saturday
        const activities = [
            createActivity({ date: new Date('2025-06-21') })
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern).toEqual([0, 0, 0, 0, 0, 1, 0]);
    });

    it('handles mixed weekday and weekend activities', () => {
        const activities = [
            createActivity({ date: new Date('2025-06-16') }), // Monday
            createActivity({ date: new Date('2025-06-16') }), // Monday
            createActivity({ date: new Date('2025-06-21') }), // Saturday
            createActivity({ date: new Date('2025-06-21') }), // Saturday
            createActivity({ date: new Date('2025-06-21') }), // Saturday
            createActivity({ date: new Date('2025-06-22') })  // Sunday
        ];

        const pattern = calculateWeeklyPattern(activities);

        expect(pattern[0]).toBe(2); // Monday
        expect(pattern[5]).toBe(3); // Saturday
        expect(pattern[6]).toBe(1); // Sunday
        // Other days should be 0
        expect(pattern[1]).toBe(0);
        expect(pattern[2]).toBe(0);
        expect(pattern[3]).toBe(0);
        expect(pattern[4]).toBe(0);
    });
});
