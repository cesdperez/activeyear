import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
	calculateQuarterTotals,
	calculateLongestBreak,
	calculateWeekdayTotals,
	calculateSportAverages,
	calculateYearStats,
	calculateLongestStreak,
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern,
	summaryMetricWithValue,
	summaryMetricsWithValue
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
	favorite: false,
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

describe.each(['America/Los_Angeles', 'Asia/Tokyo'])('day keys in %s', (timeZone) => {
	const originalTz = process.env.TZ;
	beforeAll(() => {
		process.env.TZ = timeZone;
	});
	afterAll(() => {
		process.env.TZ = originalTz;
	});

	it('counts an early and a late activity on the same local date as one active day', () => {
		const activities = [
			createActivity({ date: new Date('2025-06-15 00:30:00') }),
			createActivity({ date: new Date('2025-06-15 23:30:00') })
		];

		expect(calculateYearStats(activities).activeDays).toBe(1);
	});

	it('does not join local dates two days apart into a streak', () => {
		const activities = [
			createActivity({ date: new Date('2025-06-15 23:30:00') }),
			createActivity({ date: new Date('2025-06-17 00:30:00') })
		];

		expect(calculateLongestStreak(activities)).toBe(1);
	});

	it('keeps a streak across a daylight saving change', () => {
		const activities = ['2025-03-08', '2025-03-09', '2025-03-10', '2025-11-01', '2025-11-02'].map(
			(day) => createActivity({ date: new Date(`${day} 12:00:00`) })
		);

		expect(calculateLongestStreak(activities)).toBe(3);
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

	it('correctly maps all days of the week', () => {
		// Create activities for a full week starting Monday 2025-06-16
		const activities = [
			createActivity({ date: new Date('2025-06-16') }), // Monday
			createActivity({ date: new Date('2025-06-17') }), // Tuesday
			createActivity({ date: new Date('2025-06-18') }), // Wednesday
			createActivity({ date: new Date('2025-06-19') }), // Thursday
			createActivity({ date: new Date('2025-06-20') }), // Friday
			createActivity({ date: new Date('2025-06-21') }), // Saturday
			createActivity({ date: new Date('2025-06-22') }) // Sunday
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
			createActivity({ date: new Date('2025-06-17') }) // Tuesday
		];

		const pattern = calculateWeeklyPattern(activities);

		expect(pattern[0]).toBe(2); // 2 Mondays
		expect(pattern[1]).toBe(1); // 1 Tuesday
	});

	it('handles mixed weekday and weekend activities', () => {
		const activities = [
			createActivity({ date: new Date('2025-06-16') }), // Monday
			createActivity({ date: new Date('2025-06-16') }), // Monday
			createActivity({ date: new Date('2025-06-21') }), // Saturday
			createActivity({ date: new Date('2025-06-21') }), // Saturday
			createActivity({ date: new Date('2025-06-21') }), // Saturday
			createActivity({ date: new Date('2025-06-22') }) // Sunday
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

describe('summaryMetricWithValue', () => {
	const statsOf = (overrides: Partial<Activity>) =>
		calculateYearStats([createActivity({ distance: 0, elevation: 0, calories: 0, ...overrides })]);

	it('keeps the current stat when it has a value', () => {
		expect(summaryMetricWithValue(statsOf({ calories: 200 }), 'duration', 'km')).toBe('duration');
	});

	it('skips a stat that would display as zero', () => {
		const stats = statsOf({ duration: 0, calories: 200 });

		expect(summaryMetricWithValue(stats, 'duration', 'km')).toBe('calories');
		expect(
			summaryMetricWithValue(statsOf({ distance: 0.04, calories: 200 }), 'distance', 'km')
		).toBe('duration');
		expect(
			summaryMetricWithValue(
				statsOf({ duration: 0, elevation: 4, calories: 200 }),
				'elevation',
				'km'
			)
		).toBe('calories');
	});

	it('judges distance and elevation in the chosen unit', () => {
		const stats = statsOf({ duration: 0, elevation: 6, calories: 200 });

		expect(summaryMetricWithValue(stats, 'elevation', 'km')).toBe('elevation');
		expect(summaryMetricWithValue(stats, 'elevation', 'miles')).toBe('calories');
	});

	it('keeps the current stat when no stat has a value', () => {
		expect(summaryMetricWithValue(statsOf({ duration: 0 }), 'distance', 'km')).toBe('distance');
	});

	it('lists every stat with a value in panel order', () => {
		expect(
			summaryMetricsWithValue(statsOf({ duration: 0, elevation: 6, calories: 200 }), 'km')
		).toEqual(['elevation', 'calories']);
		expect(summaryMetricsWithValue(statsOf({ duration: 0, elevation: 6 }), 'miles')).toEqual([]);
	});

	it('counts a sub-minute duration as a value', () => {
		const stats = statsOf({ duration: 30, calories: 200 });

		expect(summaryMetricWithValue(stats, 'duration', 'km')).toBe('duration');
	});
});

describe('more stats', () => {
	it('returns four empty quarters and groups local year boundaries', () => {
		expect(calculateQuarterTotals([])).toEqual(
			[1, 2, 3, 4].map((quarter) => ({ quarter, distance: 0, duration: 0, count: 0 }))
		);
		expect(
			calculateQuarterTotals([
				createActivity({ date: new Date(2024, 11, 31), distance: 2, duration: 3 }),
				createActivity({ date: new Date(2025, 0, 1), distance: 4, duration: 5 })
			])
		).toEqual([
			{ quarter: 1, distance: 4, duration: 5, count: 1 },
			{ quarter: 2, distance: 0, duration: 0, count: 0 },
			{ quarter: 3, distance: 0, duration: 0, count: 0 },
			{ quarter: 4, distance: 2, duration: 3, count: 1 }
		]);
	});

	it('finds gaps across years, deduplicates days and picks the earliest tie', () => {
		const dates = [
			new Date(2025, 0, 13),
			new Date(2024, 11, 31, 12),
			new Date(2025, 0, 10),
			new Date(2024, 11, 31, 20)
		];
		expect(calculateLongestBreak(dates.map((date) => createActivity({ date })))).toEqual({
			days: 9,
			start: new Date(2025, 0, 1),
			end: new Date(2025, 0, 9)
		});
		const tie = [1, 4, 7].reverse().map((day) => createActivity({ date: new Date(2025, 0, day) }));
		expect(calculateLongestBreak(tie)).toEqual({
			days: 2,
			start: new Date(2025, 0, 2),
			end: new Date(2025, 0, 3)
		});
	});

	it('returns null without a gap', () => {
		expect(calculateLongestBreak([])).toBeNull();
		expect(calculateLongestBreak([createActivity()])).toBeNull();
		expect(
			calculateLongestBreak(
				[1, 1, 2].map((day) => createActivity({ date: new Date(2025, 0, day) }))
			)
		).toBeNull();
	});

	describe('longest break in Europe/Madrid', () => {
		const originalTz = process.env.TZ;
		beforeAll(() => {
			process.env.TZ = 'Europe/Madrid';
		});
		afterAll(() => {
			process.env.TZ = originalTz;
		});

		it('counts calendar days across DST', () => {
			expect(
				calculateLongestBreak(
					[28, 31].map((day) => createActivity({ date: new Date(2025, 2, day) }))
				)
			).toEqual({ days: 2, start: new Date(2025, 2, 29), end: new Date(2025, 2, 30) });
		});
	});

	it('sums weekday totals Monday first', () => {
		expect(calculateWeekdayTotals([])).toEqual({
			distance: [0, 0, 0, 0, 0, 0, 0],
			duration: [0, 0, 0, 0, 0, 0, 0]
		});
		expect(
			calculateWeekdayTotals([
				createActivity({ date: new Date(2025, 0, 5), distance: 2, duration: 3 }),
				createActivity({ date: new Date(2025, 0, 6), distance: 4, duration: 5 }),
				createActivity({ date: new Date(2025, 0, 6), distance: 6, duration: 7 })
			])
		).toEqual({ distance: [10, 0, 0, 0, 0, 0, 2], duration: [12, 0, 0, 0, 0, 0, 3] });
	});

	it('averages sports in input order, skipping zero counts', () => {
		expect(calculateSportAverages([])).toEqual([]);
		expect(
			calculateSportAverages([
				{ type: 'cycling', distance: 30, duration: 300, count: 2 },
				{ type: 'walking', distance: 0, duration: 0, count: 0 },
				{ type: 'running', distance: 9, duration: 90, count: 3 }
			])
		).toEqual([
			{ type: 'cycling', count: 2, averageDistance: 15, averageDuration: 150 },
			{ type: 'running', count: 3, averageDistance: 3, averageDuration: 30 }
		]);
	});
});

describe('summary metric display boundaries', () => {
	const base = {
		totalDistance: 0,
		totalElevation: 0,
		totalDuration: 0,
		totalCalories: 1,
		activeDays: 0,
		longestStreak: 0,
		activityCount: 0
	};

	it.each([
		{ metric: 'distance', value: 0.04, unit: 'km', expected: 'calories' },
		{ metric: 'distance', value: 0.05, unit: 'km', expected: 'distance' },
		{ metric: 'elevation', value: 4.99, unit: 'km', expected: 'calories' },
		{ metric: 'elevation', value: 5, unit: 'km', expected: 'elevation' },
		{ metric: 'elevation', value: 7.6, unit: 'miles', expected: 'calories' },
		{ metric: 'elevation', value: 7.63, unit: 'miles', expected: 'elevation' },
		{ metric: 'duration', value: 0, unit: 'km', expected: 'calories' },
		{ metric: 'duration', value: 0.01, unit: 'km', expected: 'duration' },
		{ metric: 'duration', value: 59.9, unit: 'km', expected: 'duration' },
		{ metric: 'distance', value: Infinity, unit: 'km', expected: 'calories' },
		{ metric: 'duration', value: Infinity, unit: 'km', expected: 'calories' }
	] as const)('$metric $value $unit shows $expected', ({ metric, value, unit, expected }) => {
		const field =
			metric === 'distance'
				? 'totalDistance'
				: metric === 'elevation'
					? 'totalElevation'
					: 'totalDuration';
		expect(summaryMetricWithValue({ ...base, [field]: value }, metric, unit)).toBe(expected);
	});

	it('keeps the current metric when its total calories are non-finite', () => {
		const stats = { ...base, totalDistance: 1, totalCalories: NaN };
		expect(summaryMetricWithValue(stats, 'distance', 'km')).toBe('distance');
	});
});
