import { describe, it, expect } from 'vitest';
import type { YearStats } from '#lib/types/index.js';
import { scaledLength, splitUnits, totalStats } from './totals.js';

const stats: YearStats = {
	totalDistance: 2032,
	totalDuration: 540000,
	totalCalories: 124930,
	totalElevation: 15420,
	activeDays: 180,
	longestStreak: 12,
	activityCount: 245
};

describe('totalStats', () => {
	it('lists the four totals in panel order with their fun facts', () => {
		expect(totalStats('en', stats, 'km')).toEqual([
			expect.objectContaining({
				id: 'distance',
				label: 'Total distance',
				value: '2,032km',
				funFact: '5.1% of a lap around the globe'
			}),
			expect.objectContaining({ id: 'elevation', label: 'Elevation gained', value: '15,420m' }),
			expect.objectContaining({ id: 'duration', label: 'Time active', value: '150h 0m' }),
			expect.objectContaining({
				id: 'calories',
				label: 'Calories burned',
				value: '124,930kcal',
				funFact: '438 pizza slices burnt'
			})
		]);
	});

	it('formats a part of the total the same way as the whole', () => {
		const distance = totalStats('en', stats, 'miles')[0];

		expect(distance.format(distance.total)).toBe(distance.value);
		expect(distance.format(0)).toBe('0.0mi');
	});

	it('labels and formats the totals in the page language', () => {
		const [distance, , duration] = totalStats('de', stats, 'km');

		expect(distance).toEqual(expect.objectContaining({ label: 'Gesamtdistanz', value: '2.032km' }));
		expect(duration.value).toBe('150h 0m');
	});
});

describe('scaledLength', () => {
	it('counts unit characters at their smaller size', () => {
		expect(scaledLength('2,032km', 0.5)).toBe(6);
		expect(scaledLength('150h 0m', 0.5)).toBe(6);
		expect(scaledLength('180', 0.5)).toBe(3);
	});

	it('counts group separators of other locales as part of the number', () => {
		expect(scaledLength('2.032,5km', 0.5)).toBe(8);
		expect(scaledLength('2\u202f032,5km', 0.5)).toBe(8);
	});
});

describe('splitUnits', () => {
	it('splits each number from the unit after it', () => {
		expect(splitUnits('2,032km')).toEqual([{ number: '2,032', unit: 'km' }]);
		expect(splitUnits('150h 0m')).toEqual([
			{ number: '150', unit: 'h' },
			{ number: '0', unit: 'm' }
		]);
		expect(splitUnits('42.5mi')).toEqual([{ number: '42.5', unit: 'mi' }]);
	});

	it('keeps a German number with decimal comma and dot grouping whole', () => {
		expect(splitUnits('12.345,6km')).toEqual([{ number: '12.345,6', unit: 'km' }]);
		expect(splitUnits('1.234h 5m')).toEqual([
			{ number: '1.234', unit: 'h' },
			{ number: '5', unit: 'm' }
		]);
	});

	it('keeps a French number grouped by narrow no-break spaces whole', () => {
		expect(splitUnits('12\u202f345,6km')).toEqual([{ number: '12\u202f345,6', unit: 'km' }]);
		expect(splitUnits('1\u00a0234kcal')).toEqual([{ number: '1\u00a0234', unit: 'kcal' }]);
	});
});
