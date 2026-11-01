import { describe, it, expect } from 'vitest';
import {
	rankSports,
	selectTopSports,
	sportDonutSegments,
	sportColorsFor,
	donutCentre,
	weeklyBars,
	activeDaysPercent
} from './breakdown.js';
import { OTHER_SPORT_COLOR, sportNames } from '#lib/constants/sports.js';
import type { ActivityType, SportBreakdown, WeeklyPattern } from '#lib/types/index.js';

const sport = (overrides: Partial<SportBreakdown>): SportBreakdown => ({
	type: 'running',
	distance: 0,
	duration: 7200,
	count: 1,
	...overrides
});

describe('rankSports', () => {
	it('ranks every consolidated sport by the chosen metric without a limit', () => {
		const breakdown = [
			sport({ type: 'running', count: 5 }),
			sport({ type: 'cycling', count: 9 }),
			sport({ type: 'swimming', count: 3 }),
			sport({ type: 'hiking', count: 7 }),
			sport({ type: 'yoga', count: 1 })
		];

		expect(rankSports(breakdown, 'count').map((s) => s.type)).toEqual([
			'cycling',
			'hiking',
			'running',
			'swimming',
			'yoga'
		]);
	});
});

describe('selectTopSports', () => {
	const fiveSports = [
		sport({ type: 'running', count: 5, duration: 36000 }),
		sport({ type: 'cycling', count: 9, duration: 7200 }),
		sport({ type: 'swimming', count: 3, duration: 90000 }),
		sport({ type: 'hiking', count: 7, duration: 10800 }),
		sport({ type: 'yoga', count: 1, duration: 3600 })
	];

	it('keeps the top four by the chosen metric when there are four or fewer', () => {
		const four = fiveSports.slice(0, 4);

		expect(selectTopSports(four, 'count').map((s) => s.type)).toEqual([
			'cycling',
			'hiking',
			'running',
			'swimming'
		]);
		expect(selectTopSports(four, 'duration').map((s) => s.type)).toEqual([
			'swimming',
			'running',
			'hiking',
			'cycling'
		]);
	});

	it('folds the sports beyond the top three into "other" so the totals stay whole', () => {
		const top = selectTopSports(fiveSports, 'count');

		expect(top.map((s) => s.type)).toEqual(['cycling', 'hiking', 'running', 'other']);
		expect(top.at(-1)).toEqual({ type: 'other', distance: 0, duration: 93600, count: 4 });
		expect(top.reduce((sum, s) => sum + s.count, 0)).toBe(25);
	});

	it('merges an existing "other" entry with the folded sports', () => {
		const breakdown = [...fiveSports, sport({ type: 'other', count: 2, duration: 7200 })];

		const top = selectTopSports(breakdown, 'duration');

		expect(top.map((s) => s.type)).toEqual(['swimming', 'running', 'other', 'hiking']);
		expect(top.reduce((sum, s) => sum + s.duration, 0)).toBe(154800);
	});

	it('folds sports under one hour into "other" before ranking', () => {
		const breakdown = [
			sport({ type: 'running', count: 2 }),
			sport({ type: 'yoga', count: 4, duration: 1800 }),
			sport({ type: 'walking', count: 3, duration: 1200 })
		];

		expect(selectTopSports(breakdown, 'count')).toEqual([
			{ type: 'other', distance: 0, duration: 3000, count: 7 },
			sport({ type: 'running', count: 2 })
		]);
	});

	it('returns an empty list for no data', () => {
		expect(selectTopSports([], 'count')).toEqual([]);
	});
});

describe('sportDonutSegments', () => {
	const sports = [
		sport({ type: 'running', count: 3, duration: 3600 }),
		sport({ type: 'cycling', count: 1, duration: 10800 })
	];

	it('splits the circumference by activity count with a 4 unit gap on export cards', () => {
		expect(sportDonutSegments(sports, 'count', 100, 'export')).toMatchObject([
			{ dashArray: '71 100', offset: 0 },
			{ dashArray: '21 100', offset: 75 }
		]);
	});

	it('uses a 2 unit gap on the dashboard', () => {
		expect(sportDonutSegments(sports, 'count', 100, 'dashboard')).toMatchObject([
			{ dashArray: '73 100', offset: 0 },
			{ dashArray: '23 100', offset: 75 }
		]);
	});

	it('sizes slices by time in time mode', () => {
		expect(sportDonutSegments(sports, 'duration', 100, 'export')).toMatchObject([
			{ dashArray: '21 100', offset: 0 },
			{ dashArray: '71 100', offset: 25 }
		]);
	});

	it('leaves out slices too small to outlast the gap', () => {
		const withSliver = [sport({ count: 97 }), sport({ type: 'cycling', count: 3 })];

		const segments = sportDonutSegments(withSliver, 'count', 100, 'export');

		expect(segments.map((s) => s.dashArray)).toEqual(['93 100']);
	});

	it('colours each slice like its bar', () => {
		const segments = sportDonutSegments(sports, 'count', 100, 'export');

		expect(segments.map((s) => s.color)).toEqual(sportColorsFor(sports));
	});
});

describe('sportColorsFor', () => {
	const allTypes = Object.keys(sportNames) as ActivityType[];

	it('gives every sport a distinct colour even when all types are shown', () => {
		const colors = sportColorsFor(allTypes.map((type) => sport({ type })));

		expect(new Set(colors).size).toBe(allTypes.length);
	});

	it('gives "other" its own neutral colour wherever it ranks', () => {
		const colors = sportColorsFor([
			sport({ type: 'other' }),
			sport({ type: 'running' }),
			sport({ type: 'cycling' }),
			sport({ type: 'swimming' }),
			sport({ type: 'hiking' }),
			sport({ type: 'yoga' })
		]);

		expect(colors[0]).toBe(OTHER_SPORT_COLOR);
		expect(new Set(colors).size).toBe(6);
	});
});

describe('donutCentre', () => {
	it('shows the activity count in activity mode', () => {
		expect(donutCentre([sport({ count: 3 }), sport({ count: 4 })], 'count')).toEqual({
			value: '7',
			label: 'Activities'
		});
		expect(donutCentre([sport({ count: 1 })], 'count')).toEqual({
			value: '1',
			label: 'Activity'
		});
	});

	it('shows the total hours in time mode', () => {
		expect(donutCentre([sport({ duration: 7200 }), sport({ duration: 5400 })], 'duration')).toEqual(
			{ value: '4', label: 'Hours' }
		);
		expect(donutCentre([sport({ duration: 3600 })], 'duration')).toEqual({
			value: '1',
			label: 'Hour'
		});
	});

	it('groups thousands', () => {
		expect(donutCentre([sport({ count: 1200 })], 'count').value).toBe('1,200');
	});
});

describe('weeklyBars', () => {
	it('scales bars to the busiest day and flags the two busiest days', () => {
		const pattern: WeeklyPattern = [10, 5, 0, 20, 10, 1, 0];

		const bars = weeklyBars(pattern, 100);

		expect(bars.map((b) => b.heightPercent)).toEqual([50, 25, 0, 100, 50, 5, 0]);
		expect(bars.map((b) => b.barHeight)).toEqual([50, 25, 8, 100, 50, 8, 8]);
		expect(bars.map((b) => b.isTopDay)).toEqual([true, false, false, true, false, false, false]);
	});
});

describe('activeDaysPercent', () => {
	it('is the share of the year with activity, capped at 100', () => {
		expect(activeDaysPercent(73, 2026)).toBe(20);
		expect(activeDaysPercent(400, 2026)).toBe(100);
	});

	it('counts 366 days in a leap year', () => {
		expect(activeDaysPercent(183, 2028)).toBe(50);
		expect(activeDaysPercent(366, 2028)).toBe(100);
	});
});
