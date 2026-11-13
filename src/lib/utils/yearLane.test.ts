import { dayOfYear } from './date.js';
import { describe, it, expect } from 'vitest';
import type { Activity } from '#lib/types/index.js';
import {
	laneMarkers,
	laneTicks,
	markerLeft,
	mergeCloseMarkers,
	monthStartDays,
	recordActivities
} from './yearLane.js';

const activity = (date: string, duration = 3600): Activity => ({
	date: new Date(date),
	type: 'running',
	title: '',
	distance: 10,
	duration,
	calories: 0,
	elevation: 0,
	favorite: false
});

describe('dayOfYear', () => {
	it('counts from 0 on 1 January in local time', () => {
		expect(dayOfYear(new Date(2026, 0, 1, 23, 59))).toBe(0);
		expect(dayOfYear(new Date(2026, 11, 31, 0, 1))).toBe(364);
	});

	it('counts 29 February in a leap year', () => {
		expect(dayOfYear(new Date(2028, 2, 1))).toBe(60);
		expect(dayOfYear(new Date(2028, 11, 31))).toBe(365);
	});

	it('is not thrown off by a daylight saving change', () => {
		expect(dayOfYear(new Date(2026, 2, 30, 0, 30))).toBe(88);
		expect(dayOfYear(new Date(2026, 9, 26, 0, 30))).toBe(298);
	});
});

describe('laneTicks', () => {
	it('has one tick per day of the year, leap years included', () => {
		expect(laneTicks([], 2026)).toHaveLength(365);
		expect(laneTicks([], 2028)).toHaveLength(366);
	});

	it('marks rest days with height 0', () => {
		expect(laneTicks([], 2026).every((height) => height === 0)).toBe(true);
	});

	it('sums the activities of a day and scales the busiest day to 1', () => {
		const ticks = laneTicks(
			[
				activity('2026-01-01T08:00:00', 1800),
				activity('2026-01-01T18:00:00', 1800),
				activity('2026-01-03T08:00:00', 3600 * 4)
			],
			2026
		);

		expect(ticks[2]).toBe(1);
		expect(ticks[0]).toBeGreaterThan(0);
		expect(ticks[0]).toBeLessThan(1);
		expect(ticks[1]).toBe(0);
	});

	it('keeps a short active day visibly taller than a rest day', () => {
		const ticks = laneTicks(
			[activity('2026-01-01T08:00:00', 60), activity('2026-01-02T08:00:00', 3600 * 10)],
			2026
		);

		expect(ticks[0]).toBeGreaterThanOrEqual(0.3);
	});

	it('marks a day active even when its activities have no duration', () => {
		expect(laneTicks([activity('2026-05-01T08:00:00', 0)], 2026)[120]).toBeGreaterThan(0);
	});

	it('ignores activities from another year', () => {
		const ticks = laneTicks([activity('2025-12-31T08:00:00')], 2026);

		expect(ticks.every((height) => height === 0)).toBe(true);
	});
});

describe('laneMarkers', () => {
	it('places each highlight and record on its day, a record winning a shared day', () => {
		const ride = activity('2026-03-01T08:00:00');
		const run = activity('2026-06-10T08:00:00');

		expect(laneMarkers([ride, run], [run], 2026)).toEqual([
			{ day: 59, kind: 'highlight' },
			{ day: 160, kind: 'record' }
		]);
	});

	it('lists a day once however many activities mark it', () => {
		const morning = activity('2026-03-01T08:00:00');
		const evening = activity('2026-03-01T18:00:00');

		expect(laneMarkers([morning, evening], [], 2026)).toEqual([{ day: 59, kind: 'highlight' }]);
	});

	it('leaves out activities from another year', () => {
		expect(laneMarkers([activity('2025-06-01T08:00:00')], [], 2026)).toEqual([]);
	});
});

describe('mergeCloseMarkers', () => {
	const highlight = (day: number) => ({ day, kind: 'highlight' as const });
	const record = (day: number) => ({ day, kind: 'record' as const });

	it('keeps markers at least a head apart where they are', () => {
		expect(mergeCloseMarkers([highlight(100), record(110)], 365, 8)).toEqual([
			highlight(100),
			record(110)
		]);
	});

	it('merges markers closer than a head into one centred on them, a record winning', () => {
		expect(mergeCloseMarkers([highlight(100), record(102), highlight(104)], 365, 8)).toEqual([
			record(102)
		]);
	});

	it('keeps merged heads a head apart however busy the stretch', () => {
		const busy = Array.from({ length: 30 }, (_, day) => highlight(day));
		const merged = mergeCloseMarkers(busy, 365, 8);

		for (let i = 1; i < merged.length; i++) {
			expect(merged[i].day - merged[i - 1].day).toBeGreaterThanOrEqual(8);
		}
	});

	it('pulls heads at either end inside the lane before merging them', () => {
		expect(mergeCloseMarkers([highlight(0), highlight(5), highlight(364)], 365, 8)).toEqual([
			highlight(3.5),
			highlight(360.5)
		]);
	});

	it('keeps markers as they are when the head width is unknown', () => {
		const markers = [highlight(0), highlight(1)];
		expect(mergeCloseMarkers(markers, 365, 0)).toEqual(markers);
	});
});

describe('markerLeft', () => {
	it('centres a marker on its day, kept half a head inside each end of the lane', () => {
		expect(markerLeft(0, 365)).toBe(
			`clamp(var(--marker-half), ${(0.5 / 365) * 100}%, calc(100% - var(--marker-half)))`
		);
		expect(markerLeft(364, 365)).toContain(`${(364.5 / 365) * 100}%`);
	});
});

describe('monthStartDays', () => {
	it('gives the day each month starts on', () => {
		expect(monthStartDays(2026)).toEqual([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]);
		expect(monthStartDays(2028)[2]).toBe(60);
	});
});

describe('recordActivities', () => {
	it('lists the activity behind each record that exists', () => {
		const ride = activity('2026-03-01T08:00:00');
		const record = { value: 1, activity: ride };

		expect(recordActivities(null)).toEqual([]);
		expect(
			recordActivities({ longestDistance: record, longestDuration: null, biggestBurn: record })
		).toEqual([ride, ride]);
	});
});
