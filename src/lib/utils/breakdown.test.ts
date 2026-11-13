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
import { ACTIVITY_TYPES, SPORT_PALETTES } from '#lib/constants/sports.js';
import type { SportBreakdown, WeeklyPattern } from '#lib/types/index.js';

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
		expect(top.at(-1)).toEqual({
			type: 'other',
			distance: 0,
			duration: 93600,
			count: 4,
			rollup: true
		});
		expect(top.reduce((sum, s) => sum + s.count, 0)).toBe(25);
	});

	it('merges an existing "other" entry with the folded sports', () => {
		const breakdown = [...fiveSports, sport({ type: 'other', count: 2, duration: 7200 })];

		const top = selectTopSports(breakdown, 'duration');

		expect(top.map((s) => s.type)).toEqual(['swimming', 'running', 'hiking', 'other']);
		expect(top.reduce((sum, s) => sum + s.duration, 0)).toBe(154800);
	});

	it('folds sports under one hour into "other" before ranking', () => {
		const breakdown = [
			sport({ type: 'running', count: 9 }),
			sport({ type: 'yoga', count: 4, duration: 1800 }),
			sport({ type: 'walking', count: 3, duration: 1200 })
		];

		expect(selectTopSports(breakdown, 'count')).toEqual([
			sport({ type: 'running', count: 9 }),
			{ type: 'other', distance: 0, duration: 3000, count: 7, rollup: true }
		]);
	});

	it('keeps short sports named when folding them would outrank the rest', () => {
		const breakdown = [
			sport({ type: 'running', count: 2 }),
			sport({ type: 'yoga', count: 4, duration: 1800 }),
			sport({ type: 'walking', count: 3, duration: 1200 })
		];

		expect(selectTopSports(breakdown, 'count').map((s) => s.type)).toEqual([
			'yoga',
			'walking',
			'running'
		]);
	});

	describe('with one long session among one-off short ones', () => {
		const year = [
			sport({ type: 'running', count: 2, duration: 16574 }),
			sport({ type: 'cycling', count: 1, duration: 1503 }),
			sport({ type: 'strength', count: 1, duration: 1266 }),
			sport({ type: 'swimming', count: 1, duration: 2700 }),
			sport({ type: 'walking', count: 1, duration: 3600 }),
			sport({ type: 'hiking', count: 1, duration: 14100 }),
			sport({ type: 'yoga', count: 1, duration: 1176 })
		];

		it('keeps the longer sports named when counts tie', () => {
			expect(selectTopSports(year, 'count').map((s) => s.type)).toEqual([
				'running',
				'hiking',
				'walking',
				'other'
			]);
		});

		it('lists the roll-up last even when it holds more than a named sport', () => {
			const top = selectTopSports(year, 'count');

			expect(top.at(-1)).toMatchObject({ type: 'other', count: 4, rollup: true });
		});
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
	const colors = sportColorsFor(sports);

	it('splits the circumference by activity count with a 4 unit gap on export cards', () => {
		expect(sportDonutSegments(sports, colors, 'count', 100, 'export')).toMatchObject([
			{ dashArray: '71 100', offset: 0 },
			{ dashArray: '21 100', offset: 75 }
		]);
	});

	it('uses a 2 unit gap on the dashboard', () => {
		expect(sportDonutSegments(sports, colors, 'count', 100, 'dashboard')).toMatchObject([
			{ dashArray: '73 100', offset: 0 },
			{ dashArray: '23 100', offset: 75 }
		]);
	});

	it('sizes slices by time in time mode', () => {
		expect(sportDonutSegments(sports, colors, 'duration', 100, 'export')).toMatchObject([
			{ dashArray: '21 100', offset: 0 },
			{ dashArray: '71 100', offset: 25 }
		]);
	});

	it('draws a single sport as a closed ring with no gap', () => {
		const single = [sport({ count: 4 })];

		expect(
			sportDonutSegments(single, sportColorsFor(single), 'count', 100, 'export')
		).toMatchObject([{ dashArray: '100 100', offset: 0 }]);
	});

	it('leaves out slices too small to outlast the gap', () => {
		const withSliver = [sport({ count: 97 }), sport({ type: 'cycling', count: 3 })];

		const segments = sportDonutSegments(
			withSliver,
			sportColorsFor(withSliver),
			'count',
			100,
			'export'
		);

		expect(segments.map((s) => s.dashArray)).toEqual(['93 100']);
	});

	it('colours each slice by its sport, the same in both modes', () => {
		const byCount = sportDonutSegments(sports, colors, 'count', 100, 'export');
		const byTime = sportDonutSegments(sports, colors, 'duration', 100, 'export');

		expect(byCount.map((s) => s.color)).toEqual([colors.running, colors.cycling]);
		expect(byTime.map((s) => s.color)).toEqual(byCount.map((s) => s.color));
	});
});

describe('sportColorsFor', () => {
	const { colors: sportColors, other: OTHER_SPORT_COLOR } = SPORT_PALETTES.neon;
	const allTypes = ACTIVITY_TYPES;

	it('gives every sport a distinct colour even when all types are shown', () => {
		const colors = sportColorsFor(allTypes.map((type) => sport({ type })));

		expect(new Set(Object.values(colors)).size).toBe(allTypes.length);
	});

	it('assigns colours by activity count, with ties by name', () => {
		const colors = sportColorsFor([
			sport({ type: 'running', count: 5, duration: 90000 }),
			sport({ type: 'hiking', count: 9, duration: 7200 }),
			sport({ type: 'cycling', count: 9, duration: 10800 })
		]);

		expect(colors.cycling).toBe(sportColors[0]);
		expect(colors.hiking).toBe(sportColors[1]);
		expect(colors.running).toBe(sportColors[2]);
	});

	it('keeps colours across count and duration orderings', () => {
		const breakdown = [
			sport({ type: 'running', count: 5, duration: 90000 }),
			sport({ type: 'cycling', count: 9, duration: 7200 }),
			sport({ type: 'hiking', count: 3, duration: 10800 })
		];

		expect(sportColorsFor(rankSports(breakdown, 'count'))).toEqual(
			sportColorsFor(rankSports(breakdown, 'duration'))
		);
	});

	it('gives "other" its own neutral colour wherever it ranks', () => {
		const colors = sportColorsFor([
			sport({ type: 'other', count: 10 }),
			sport({ type: 'running' }),
			sport({ type: 'cycling' }),
			sport({ type: 'swimming' }),
			sport({ type: 'hiking' }),
			sport({ type: 'yoga' })
		]);

		expect(colors.other).toBe(OTHER_SPORT_COLOR);
		expect(colors.cycling).toBe(sportColors[0]);
		expect(new Set(Object.values(colors)).size).toBe(6);
	});

	it('gives "other" the neutral colour when it only appears after folding', () => {
		expect(sportColorsFor([sport({})]).other).toBe(OTHER_SPORT_COLOR);
	});

	it('uses the palette of the theme and starts with its accent', () => {
		const breakdown = [sport({ type: 'cycling', count: 9 }), sport({ type: 'running', count: 5 })];

		expect(sportColorsFor(breakdown, 'minimalist')).toMatchObject({
			cycling: '#c4281c',
			running: '#0f1417',
			other: SPORT_PALETTES.minimalist.other
		});
		expect(sportColorsFor(breakdown, 'retro')).toMatchObject({
			cycling: '#ffd23a',
			running: '#5fe08a',
			other: SPORT_PALETTES.retro.other
		});
	});

	it('wraps a short palette instead of running out of colours', () => {
		const four = ['cycling', 'hiking', 'running', 'swimming', 'yoga'] as const;
		const colors = sportColorsFor(
			four.map((type, i) => sport({ type, count: 10 - i })),
			'minimalist'
		);

		expect(colors.yoga).toBe(colors.cycling);
	});

	it('keeps duration-selected sports distinct in the Minimal palette', () => {
		const breakdown = [
			sport({ type: 'running', count: 5, duration: 50000 }),
			sport({ type: 'cycling', count: 4, duration: 10000 }),
			sport({ type: 'swimming', count: 3, duration: 9000 }),
			sport({ type: 'hiking', count: 2, duration: 8000 }),
			sport({ type: 'yoga', count: 1, duration: 40000 })
		];
		const shown = selectTopSports(breakdown, 'duration');
		const colors = sportColorsFor(shown, 'minimalist');

		expect(shown.map((s) => s.type)).toContain('yoga');
		expect(colors.other).toBe(SPORT_PALETTES.minimalist.other);
		expect(new Set(shown.map((s) => colors[s.type])).size).toBe(shown.length);
	});

	it('defaults to the Neon palette', () => {
		const breakdown = [sport({})];

		expect(sportColorsFor(breakdown)).toEqual(sportColorsFor(breakdown, 'neon'));
	});
});

describe('donutCentre', () => {
	it('shows the activity count in activity mode', () => {
		expect(donutCentre('en', [sport({ count: 3 }), sport({ count: 4 })], 'count')).toEqual({
			value: '7',
			label: 'Activities'
		});
		expect(donutCentre('en', [sport({ count: 1 })], 'count')).toEqual({
			value: '1',
			label: 'Activity'
		});
	});

	it('shows the total whole hours in time mode, like Time Active', () => {
		expect(
			donutCentre('en', [sport({ duration: 7200 }), sport({ duration: 5400 })], 'duration')
		).toEqual({ value: '3', label: 'Hours' });
		expect(donutCentre('en', [sport({ duration: 1194 * 3600 + 33 * 60 })], 'duration')).toEqual({
			value: '1,194',
			label: 'Hours'
		});
		expect(donutCentre('en', [sport({ duration: 3600 })], 'duration')).toEqual({
			value: '1',
			label: 'Hour'
		});
	});

	it('shows minutes when the total is under an hour', () => {
		expect(donutCentre('en', [sport({ duration: 1200 })], 'duration')).toEqual({
			value: '20',
			label: 'Minutes'
		});
		expect(donutCentre('en', [sport({ duration: 60 })], 'duration')).toEqual({
			value: '1',
			label: 'Minute'
		});
	});

	it('shows seconds when the total is under a minute', () => {
		expect(donutCentre('en', [sport({ duration: 45 })], 'duration')).toEqual({
			value: '45',
			label: 'Seconds'
		});
	});

	it('groups thousands', () => {
		expect(donutCentre('en', [sport({ count: 1200 })], 'count').value).toBe('1,200');
	});
});

describe('weeklyBars', () => {
	it('scales bars to the busiest day and flags the two busiest days with their ties', () => {
		const pattern: WeeklyPattern = [10, 5, 0, 20, 10, 1, 0];

		const bars = weeklyBars(pattern, 100);

		expect(bars.map((b) => b.heightPercent)).toEqual([50, 25, 0, 100, 50, 5, 0]);
		expect(bars.map((b) => b.barHeight)).toEqual([50, 25, 8, 100, 50, 8, 8]);
		expect(bars.map((b) => b.isTopDay)).toEqual([true, false, false, true, true, false, false]);
	});

	it('flags every day tied with the second busiest', () => {
		const bars = weeklyBars([3, 1, 1, 1, 1, 3, 3], 100);

		expect(bars.map((b) => b.isTopDay)).toEqual([true, false, false, false, false, true, true]);
	});
});

describe('activeDaysPercent', () => {
	it('is the share of the year with activity, capped at 100', () => {
		expect(activeDaysPercent(73, 365)).toBe(20);
		expect(activeDaysPercent(400, 365)).toBe(100);
	});

	it('uses elapsed days for a partial year', () => {
		expect(activeDaysPercent(40, 227)).toBeCloseTo(17.621145);
	});

	it('counts 366 days in a leap year', () => {
		expect(activeDaysPercent(183, 366)).toBe(50);
		expect(activeDaysPercent(366, 366)).toBe(100);
	});
});

it('localizes the donut centre', () => {
	expect(donutCentre('de', [sport({ count: 1200 })], 'count')).toEqual({
		value: '1.200',
		label: 'Aktivitäten'
	});
	expect(donutCentre('es', [sport({ duration: 60 })], 'duration').label).toBe('Minuto');
});
